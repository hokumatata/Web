import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { generateArticleDraft, CATEGORY_SLUGS, type ArticleSources } from "@/lib/ai";
import { getConfiguredFeeds, fetchFeedItems, type FeedItem } from "@/lib/sources";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled article drafting from public news feeds (Vercel Cron).
 *
 * Reads the configured RSS/Atom feeds (CoinGape, FXStreet, Yahoo Finance by
 * default — see src/lib/sources.ts), picks the newest items it hasn't seen
 * before, and drafts ONE original house-style article per item via OpenAI.
 * Everything is saved as DRAFT for human review — this never auto-publishes.
 *
 * Cost guardrails:
 * - At most SOURCE_DRAFTS_PER_RUN drafts per run (default 3), one cheap
 *   gpt-4o-mini call each; no image generation.
 * - Remaining new items are recorded as "seen" (no draft) so we don't build a
 *   perpetual backlog or reprocess them.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Manual runs
 * may instead pass `x-api-key: <PUBLISH_API_KEY>`.
 */

// Nudge the model toward a sensible category based on the source publication.
const CATEGORY_HINT_BY_SOURCE: Record<string, string> = {
  coingape: "crypto",
  forexlive: "forex",
  fxstreet: "forex",
  "yahoo finance": "stocks",
  bloomberg: "macro",
};

function authorize(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const publishKey = process.env.PUBLISH_API_KEY;
  if (publishKey && req.headers.get("x-api-key") === publishKey) return true;

  return false;
}

async function draftFromItem(item: FeedItem, authorId: string): Promise<string | null> {
  const sources: ArticleSources = {
    keyIdeas: item.title,
    referenceText: item.summary,
    referenceUrls: item.link,
    categoryHint: CATEGORY_HINT_BY_SOURCE[item.source.toLowerCase()],
  };

  const draft = await generateArticleDraft(sources);

  // Resolve category, falling back to "analysis" if the suggested slug has no row.
  const slug = (CATEGORY_SLUGS as readonly string[]).includes(draft.categorySlug)
    ? draft.categorySlug
    : "analysis";
  const cat =
    (await prisma.category.findUnique({ where: { slug } })) ??
    (await prisma.category.findUnique({ where: { slug: "analysis" } }));
  if (!cat) return null;

  const attribution = `\n\n---\n*Inspired by reporting from ${item.source}. [Read the original source](${item.link}).*`;
  const articleSlug = slugify(draft.title) + "-" + Date.now().toString(36);

  const article = await prisma.article.create({
    data: {
      slug: articleSlug,
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body + attribution,
      coverImageUrl: "",
      thumbnailUrl: null,
      categoryId: cat.id,
      authorId,
      status: "DRAFT",
      publishedAt: null,
    },
  });

  for (const tagName of draft.tags) {
    const tag = await prisma.tag.findUnique({ where: { slug: slugify(tagName) } });
    if (tag) {
      await prisma.articleTag
        .create({ data: { articleId: article.id, tagId: tag.id } })
        .catch(() => {});
    }
  }

  return article.id;
}

async function run(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  const perRun = Math.max(1, Math.min(10, Number(process.env.SOURCE_DRAFTS_PER_RUN ?? 3)));
  const authorEmail = process.env.SOURCE_AUTHOR_EMAIL ?? "masteruser@theforexrepublic.com";

  const author = await prisma.user.findUnique({ where: { email: authorEmail } });
  if (!author) return error(`Automation author "${authorEmail}" not found`, 500);

  // Gather items from all feeds, newest first.
  const feeds = getConfiguredFeeds();
  const all = (await Promise.all(feeds.map((f) => fetchFeedItems(f)))).flat();
  all.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  // Skip anything we've already recorded.
  const links = all.map((i) => i.link);
  const seen = await prisma.sourceItem.findMany({
    where: { link: { in: links } },
    select: { link: true },
  });
  const seenLinks = new Set(seen.map((s) => s.link));
  const fresh = all.filter((i) => !seenLinks.has(i.link));

  const toDraft = fresh.slice(0, perRun);
  const toSkip = fresh.slice(perRun);

  const drafted: { title: string; source: string; articleId: string }[] = [];
  const failed: { title: string; source: string; reason: string }[] = [];

  for (const item of toDraft) {
    try {
      const articleId = await draftFromItem(item, author.id);
      if (!articleId) {
        failed.push({ title: item.title, source: item.source, reason: "no category" });
        continue;
      }
      await prisma.sourceItem.create({
        data: { link: item.link, title: item.title, source: item.source, articleId },
      });
      drafted.push({ title: item.title, source: item.source, articleId });
    } catch (e) {
      const reason = e instanceof Error ? e.message : "draft failed";
      failed.push({ title: item.title, source: item.source, reason });
    }
  }

  // Record the remaining fresh items as "seen" (no draft) to bound cost/backlog.
  if (toSkip.length > 0) {
    await prisma.sourceItem
      .createMany({
        data: toSkip.map((i) => ({ link: i.link, title: i.title, source: i.source })),
        skipDuplicates: true,
      })
      .catch(() => {});
  }

  if (drafted.length > 0) revalidateTag("articles");

  return json({
    ok: true,
    feeds: feeds.length,
    itemsSeen: all.length,
    freshItems: fresh.length,
    drafted,
    skippedRecorded: toSkip.length,
    failed,
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/utils";
import {
  generateArticleDraft,
  generateArticleImage,
  buildImagePrompt,
  runDueDiligence,
  CATEGORY_SLUGS,
  type ArticleSources,
  type DueDiligenceResult,
} from "@/lib/ai";
import { notifyReviewQueue } from "@/lib/notify";
import { getConfiguredFeeds, fetchFeedItems, type FeedItem } from "@/lib/sources";
import { put } from "@vercel/blob";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Image generation adds time per draft; allow the longer window (Vercel caps
// this to the project's plan limit — up to 300s on Pro).
export const maxDuration = 300;

/**
 * Scheduled article drafting from public news feeds (Vercel Cron).
 *
 * Reads the configured RSS/Atom feeds (CoinGape, FXStreet, Yahoo Finance by
 * default — see src/lib/sources.ts), picks the newest items it hasn't seen
 * before, and drafts ONE original house-style article per item via OpenAI.
 * Everything is saved as DRAFT for human review — this never auto-publishes.
 *
 * Each draft also gets an AI-generated cover image (uploaded to Vercel Blob),
 * unless SOURCE_GENERATE_IMAGES is set to "false". Image generation is
 * best-effort: if it fails (e.g. missing BLOB_READ_WRITE_TOKEN), the article is
 * still saved as a DRAFT with an empty cover for a human to fill in.
 *
 * Cost guardrails:
 * - At most SOURCE_DRAFTS_PER_RUN drafts per run (default 3), one cheap
 *   gpt-4o-mini call each plus one low-quality cover image.
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

/**
 * Best-effort AI cover image: generate + upload to Vercel Blob, returning the
 * public URL. Returns "" (empty cover) on any failure or when disabled, so a
 * single image error never blocks the draft.
 */
async function generateCoverImage(
  title: string,
  excerpt: string,
  categorySlug: string
): Promise<string> {
  if (process.env.SOURCE_GENERATE_IMAGES === "false") return "";
  try {
    const prompt = buildImagePrompt({ title, excerpt, categorySlug, kind: "cover" });
    const image = await generateArticleImage(prompt);
    const safeName = `${Date.now()}-${crypto.randomUUID()}.png`;
    const blob = await put(`ai-images/${safeName}`, image.buffer, {
      access: "public",
      contentType: image.contentType,
    });
    return blob.url;
  } catch (e) {
    console.error(
      "[draft-from-feeds] cover image generation failed:",
      e instanceof Error ? e.message : e
    );
    return "";
  }
}

interface DraftedArticle {
  id: string;
  title: string;
  dueDiligence: DueDiligenceResult | null;
}

async function draftFromItem(item: FeedItem, authorId: string): Promise<DraftedArticle | null> {
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

  // Automated due-diligence (best-effort): assess the draft against its source
  // so the human reviewer sees a score + flags. Never blocks the draft.
  let dueDiligence: DueDiligenceResult | null = null;
  try {
    dueDiligence = await runDueDiligence(draft, sources);
  } catch (e) {
    console.error(
      "[draft-from-feeds] due diligence failed:",
      e instanceof Error ? e.message : e
    );
  }

  const attribution = `\n\n---\n*Inspired by reporting from ${item.source}. [Read the original source](${item.link}).*`;
  const articleSlug = slugify(draft.title) + "-" + Date.now().toString(36);

  const coverImageUrl = await generateCoverImage(draft.title, draft.excerpt, slug);

  const article = await prisma.article.create({
    data: {
      slug: articleSlug,
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body + attribution,
      coverImageUrl,
      thumbnailUrl: null,
      categoryId: cat.id,
      authorId,
      // Agent output awaits explicit human approval — it never auto-publishes.
      status: "REVIEW",
      dueDiligence: dueDiligence ? JSON.stringify(dueDiligence) : null,
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

  return { id: article.id, title: draft.title, dueDiligence };
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

  const drafted: {
    title: string;
    source: string;
    articleId: string;
    dueDiligence: DueDiligenceResult | null;
  }[] = [];
  const failed: { title: string; source: string; reason: string }[] = [];

  for (const item of toDraft) {
    try {
      const result = await draftFromItem(item, author.id);
      if (!result) {
        failed.push({ title: item.title, source: item.source, reason: "no category" });
        continue;
      }
      await prisma.sourceItem.create({
        data: { link: item.link, title: item.title, source: item.source, articleId: result.id },
      });
      drafted.push({
        title: item.title,
        source: item.source,
        articleId: result.id,
        dueDiligence: result.dueDiligence,
      });
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

  if (drafted.length > 0) {
    revalidateTag("articles");
    // Best-effort: ping the reviewer that new drafts are waiting for approval.
    await notifyReviewQueue(
      drafted.map((d) => ({
        title: d.title,
        source: d.source,
        score: d.dueDiligence?.score ?? null,
        verdict: d.dueDiligence?.verdict ?? null,
      }))
    ).catch(() => {});
  }

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

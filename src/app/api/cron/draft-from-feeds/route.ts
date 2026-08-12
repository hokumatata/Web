import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/utils";
import {
  generateArticleDraft,
  runDueDiligence,
  CATEGORY_SLUGS,
  type ArticleSources,
  type DueDiligenceResult,
} from "@/lib/ai";
import { allowsTechnicals } from "@/lib/house-style";
import { buildStoryQueue, selectDiverseQueue, type StoryCluster } from "@/lib/cluster";
import {
  computeTechnicals,
  findInstrument,
  formatTechnicalBlock,
  findUnsupportedLevels,
} from "@/lib/technicals";
import { notifyReviewQueue } from "@/lib/notify";
import { getConfiguredFeeds, fetchFeedItems, type Beat } from "@/lib/sources";
import { syncEconCalendar } from "@/lib/econ-calendar-store";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Drafting + due diligence can exceed the default; allow the longer window
// (Vercel caps this to the project's plan limit — up to 300s on Pro).
export const maxDuration = 300;

/**
 * Scheduled article drafting from public news feeds.
 *
 * Pipeline per run:
 *  1. Read the configured RSS/Atom feeds (see src/lib/sources.ts).
 *  2. Drop anything already recorded in SourceItem.
 *  3. Cluster the remainder so several outlets on the same event become ONE
 *     story, and score each cluster for newsworthiness (src/lib/cluster.ts).
 *     Junk and off-topic clusters never reach a model call.
 *  4. For the best clusters, write one original synthesised article each, using
 *     the outline for the detected story type (src/lib/house-style.ts).
 *  5. For chart-led stories, compute real technical levels first
 *     (src/lib/technicals.ts) and constrain the model to those numbers.
 *  6. Run automated due diligence and save as REVIEW for human approval.
 *
 * Nothing is ever auto-published.
 *
 * Cost guardrails:
 * - Clustering, scoring and story-type detection are local and free.
 * - Only clusters scoring >= SOURCE_MIN_SCORE (default 45) are written.
 * - At most SOURCE_DRAFTS_PER_RUN articles per run (default 3).
 * - Clustering means N outlets covering one event cost one article, not N.
 * - Remaining fresh items are recorded as "seen" so we don't build a backlog.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Manual runs
 * may instead pass `x-api-key: <PUBLISH_API_KEY>`.
 */

/**
 * Nudge the model toward a sensible category from the cluster's beat, which is
 * a property of the feed rather than of the outlet's name — adding a feed no
 * longer means remembering to add a mapping for it.
 */
const CATEGORY_HINT_BY_BEAT: Record<Beat, string> = {
  forex: "forex",
  crypto: "crypto",
  equities: "stocks",
  macro: "macro",
  // Metals belong in "gold"; energy and the rest read as macro.
  commodities: "macro",
};

function categoryHint(cluster: StoryCluster): string {
  if (
    cluster.beat === "commodities" &&
    (cluster.instrumentSlug === "xauusd" || cluster.instrumentSlug === "xagusd")
  ) {
    return "gold";
  }
  return CATEGORY_HINT_BY_BEAT[cluster.beat];
}

function authorize(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const publishKey = process.env.PUBLISH_API_KEY;
  if (publishKey && req.headers.get("x-api-key") === publishKey) return true;

  return false;
}

interface DraftedArticle {
  id: string;
  title: string;
  dueDiligence: DueDiligenceResult | null;
}

async function draftFromCluster(
  cluster: StoryCluster,
  authorId: string
): Promise<DraftedArticle | null> {
  // Chart-led stories need real levels before we write a word.
  let technicalBlock: string | undefined;
  let storyType = cluster.storyType;
  let snapshot: Awaited<ReturnType<typeof computeTechnicals>> | null = null;

  if (allowsTechnicals(cluster.storyType) && cluster.instrumentSlug) {
    const instrument = findInstrument(cluster.instrumentSlug);
    if (instrument) {
      try {
        snapshot = await computeTechnicals(instrument);
        technicalBlock = formatTechnicalBlock(snapshot);
      } catch (e) {
        console.error(
          "[draft-from-feeds] technicals unavailable, dropping chart angle:",
          e instanceof Error ? e.message : e
        );
        storyType = "general";
      }
    } else {
      storyType = "general";
    }
  }

  const sources: ArticleSources = {
    storyType,
    technicalBlock,
    reports: cluster.items.map((i) => ({
      outlet: i.source,
      headline: i.title,
      summary: i.summary,
      url: i.link,
      publishedAt: i.publishedAt,
    })),
    categoryHint: categoryHint(cluster),
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

  // Arithmetic check: every price level in a chart-led piece must trace back to
  // the computed snapshot. This is a hard verification, not a model opinion.
  if (snapshot) {
    const unsupported = findUnsupportedLevels(draft.body, snapshot);
    if (unsupported.length > 0) {
      dueDiligence = {
        score: Math.max(0, (dueDiligence?.score ?? 60) - 25),
        verdict: "flag",
        flags: [...(dueDiligence?.flags ?? []), ...unsupported],
        notes: dueDiligence?.notes ?? "",
        styleViolations: dueDiligence?.styleViolations,
      };
    }
  }

  const articleSlug = slugify(draft.title) + "-" + Date.now().toString(36);

  const article = await prisma.article.create({
    data: {
      slug: articleSlug,
      title: draft.title,
      excerpt: draft.excerpt,
      // Body is desk prose only — outlet credits stay in SourceItem / Review Queue,
      // not appended into the article body as a sources dump.
      body: draft.body,
      coverImageUrl: "",
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

  // Archive this week's economic calendar. The upstream feed only exposes the
  // current week, so this is what builds the calendar's history over time.
  // Best-effort: a failure here must not stop article drafting.
  const calendarSync = await syncEconCalendar().catch((e) => {
    console.error(
      "[draft-from-feeds] calendar sync failed:",
      e instanceof Error ? e.message : e
    );
    return { fetched: 0, written: 0 };
  });

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

  // Cluster + score locally (free), then write only the best stories.
  const minScore = Math.max(0, Math.min(100, Number(process.env.SOURCE_MIN_SCORE ?? 45)));
  const queue = buildStoryQueue(fresh, minScore);
  // Spread the run across beats so a Fed day doesn't crowd crypto, gold and
  // equities off the site entirely.
  const toDraft = selectDiverseQueue(queue, perRun);

  // Retire only what the gate rejected. A story that cleared the gate but did
  // not fit this run's budget stays eligible, so the next run picks up the best
  // remaining story rather than burning it — the whole point of the gate is to
  // write the strongest stories, not merely the first ones to arrive. The
  // freshness window inside buildStoryQueue stops this becoming a backlog.
  const queuedLinks = new Set(queue.flatMap((c) => c.items.map((i) => i.link)));
  const toSkip = fresh.filter((i) => !queuedLinks.has(i.link));

  const drafted: {
    title: string;
    source: string;
    articleId: string;
    storyType: string;
    beat: Beat;
    score: number;
    outlets: number;
    dueDiligence: DueDiligenceResult | null;
  }[] = [];
  const failed: { title: string; source: string; reason: string }[] = [];

  for (const cluster of toDraft) {
    const primary = cluster.items[0];
    try {
      const result = await draftFromCluster(cluster, author.id);
      if (!result) {
        failed.push({ title: primary.title, source: primary.source, reason: "no category" });
        continue;
      }
      // Record every item in the cluster, so no outlet's version resurfaces.
      await prisma.sourceItem
        .createMany({
          data: cluster.items.map((i) => ({
            link: i.link,
            title: i.title,
            source: i.source,
            articleId: result.id,
          })),
          skipDuplicates: true,
        })
        .catch((e) =>
          console.error(
            "[draft-from-feeds] failed to record source items:",
            e instanceof Error ? e.message : e
          )
        );
      drafted.push({
        title: result.title,
        source: cluster.sources.join(", "),
        articleId: result.id,
        storyType: cluster.storyType,
        beat: cluster.beat,
        score: cluster.score,
        outlets: cluster.sources.length,
        dueDiligence: result.dueDiligence,
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : "draft failed";
      failed.push({ title: primary.title, source: primary.source, reason });
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
    clusters: queue.length,
    minScore,
    drafted,
    skippedRecorded: toSkip.length,
    failed,
    calendarSync,
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

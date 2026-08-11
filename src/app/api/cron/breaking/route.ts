import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/utils";
import {
  generateBreakingBrief,
  findUnsourcedFigures,
  runDueDiligence,
  CATEGORY_SLUGS,
  type ArticleSources,
  type DueDiligenceResult,
} from "@/lib/ai";
import { findBreakingViolations } from "@/lib/house-style";
import { buildStoryQueue, type StoryCluster } from "@/lib/cluster";
import {
  assessBreaking,
  formatCalendarContext,
  gatesFromEnv,
  type BreakingAssessment,
} from "@/lib/breaking";
import { getConfiguredFeeds, fetchFeedItems } from "@/lib/sources";
import { loadCalendarTimeline } from "@/lib/econ-calendar-store";
import { generateCoverBestEffort } from "@/lib/cover-image";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * The breaking lane: short wire briefs on confirmed events, published live.
 *
 * This is the only endpoint that can put an article in front of readers without
 * a human approving it, so its behaviour is worth stating plainly.
 *
 * A cluster reaches a model call only if src/lib/breaking.ts confirms the event
 * has actually happened — a first-party central-bank or agency release, or the
 * same figure from two independent outlets, timestamped inside the freshness
 * window, reported in settled language. Everything else is left for the
 * three-hourly analytical run and the review queue.
 *
 * The brief that comes back then has to survive three post-checks before it goes
 * live: due diligence must return "pass" at or above BREAKING_DD_MIN_SCORE, it
 * must contain no figure absent from the source material, and it must still look
 * like a brief. Failing any of those is not fatal to the story — it is simply
 * filed as REVIEW instead, which is where it would have gone anyway.
 *
 * Published briefs are marked isBreaking and carry a standing "developing" note,
 * because an editor is expected to expand them into a full piece afterwards.
 *
 * Set BREAKING_AUTOPUBLISH=false to keep the lane running as a fast REVIEW
 * feeder with the front page untouched.
 *
 * Auth: same as the drafting cron — `Authorization: Bearer <CRON_SECRET>` or
 * `x-api-key: <PUBLISH_API_KEY>`.
 */

function authorize(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`) return true;

  const publishKey = process.env.PUBLISH_API_KEY;
  if (publishKey && req.headers.get("x-api-key") === publishKey) return true;

  return false;
}

/** Standing footer on a published brief: says what it is and what follows. */
const DEVELOPING_NOTE =
  "\n\n---\n*Breaking: this is a first take on a confirmed release, published automatically and unedited so it reaches you immediately. Our desk is expanding it into full coverage — figures are as reported by the sources named above.*";

interface BriefResult {
  articleId: string;
  title: string;
  published: boolean;
  /** Why it published, or why it was held for review instead. */
  reasons: string[];
  holdReasons: string[];
  dueDiligence: DueDiligenceResult | null;
}

async function fileBrief(
  cluster: StoryCluster,
  assessment: BreakingAssessment,
  authorId: string,
  autopublish: boolean,
  minDueDiligence: number
): Promise<BriefResult | null> {
  const sources: ArticleSources = {
    storyType: cluster.storyType,
    reports: cluster.items.map((i) => ({
      outlet: i.source,
      headline: i.title,
      summary: i.summary,
      url: i.link,
      publishedAt: i.publishedAt,
    })),
    // The calendar entry, when we matched one, is the only place a consensus or
    // prior figure may come from.
    releases: assessment.calendarEvent
      ? formatCalendarContext(assessment.calendarEvent)
      : undefined,
  };

  const draft = await generateBreakingBrief(sources);

  const slug = (CATEGORY_SLUGS as readonly string[]).includes(draft.categorySlug)
    ? draft.categorySlug
    : "macro";
  const cat =
    (await prisma.category.findUnique({ where: { slug } })) ??
    (await prisma.category.findUnique({ where: { slug: "macro" } })) ??
    (await prisma.category.findUnique({ where: { slug: "analysis" } }));
  if (!cat) return null;

  // Post-checks. The two local ones are arithmetic and run regardless of whether
  // the model call for due diligence succeeds.
  const holdReasons: string[] = [];

  const sourceText = [
    ...cluster.items.map((i) => `${i.title} ${i.summary}`),
    assessment.calendarEvent ? formatCalendarContext(assessment.calendarEvent) : "",
  ].join(" \n ");
  const unsourced = findUnsourcedFigures(draft.body, sourceText);
  holdReasons.push(...unsourced);
  holdReasons.push(...findBreakingViolations(draft.body));

  let dueDiligence: DueDiligenceResult | null = null;
  try {
    dueDiligence = await runDueDiligence(draft, sources);
  } catch (e) {
    console.error("[breaking] due diligence failed:", e instanceof Error ? e.message : e);
  }
  if (!dueDiligence) {
    // No verdict is not a pass: an unchecked brief waits for a human.
    holdReasons.push("due diligence did not complete");
  } else {
    if (dueDiligence.verdict !== "pass") {
      holdReasons.push(`due-diligence verdict "${dueDiligence.verdict}"`);
    }
    if (dueDiligence.score < minDueDiligence) {
      holdReasons.push(`due-diligence score ${dueDiligence.score} below ${minDueDiligence}`);
    }
  }

  // The brief's own style checks already ran above; fold them into the record so
  // the review queue shows the same flags it would for any other draft.
  if (dueDiligence) {
    dueDiligence = {
      ...dueDiligence,
      flags: Array.from(new Set([...dueDiligence.flags, ...unsourced])),
    };
  }

  const publish = autopublish && holdReasons.length === 0;

  // A cover is worth a couple of seconds on a piece that stays on the front
  // page; it is never worth delaying one that is already late.
  const coverImageUrl = publish
    ? ""
    : await generateCoverBestEffort(draft.title, draft.excerpt, slug, "breaking");

  const article = await prisma.article.create({
    data: {
      slug: slugify(draft.title) + "-" + Date.now().toString(36),
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body + (publish ? DEVELOPING_NOTE : ""),
      coverImageUrl,
      thumbnailUrl: null,
      categoryId: cat.id,
      authorId,
      status: publish ? "PUBLISHED" : "REVIEW",
      isBreaking: publish,
      publishedAt: publish ? new Date() : null,
      // Record the confirmation trail either way, so "why was this live before
      // an editor saw it?" is always answerable from the row itself.
      dueDiligence: JSON.stringify({
        score: dueDiligence?.score ?? 0,
        verdict: dueDiligence?.verdict ?? "review",
        flags: dueDiligence?.flags ?? [],
        notes: dueDiligence?.notes ?? "",
        styleViolations: dueDiligence?.styleViolations,
        breaking: {
          published: publish,
          confirmedBy: assessment.reasons,
          heldBecause: holdReasons,
        },
      }),
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

  return {
    articleId: article.id,
    title: draft.title,
    published: publish,
    reasons: assessment.reasons,
    holdReasons,
    dueDiligence,
  };
}

async function run(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  const gates = gatesFromEnv();
  const perRun = Math.max(1, Math.min(5, Number(process.env.BREAKING_PER_RUN ?? 2)));
  const minDueDiligence = Math.max(
    0,
    Math.min(100, Number(process.env.BREAKING_DD_MIN_SCORE ?? 80))
  );
  const autopublish = process.env.BREAKING_AUTOPUBLISH !== "false";
  const authorEmail = process.env.SOURCE_AUTHOR_EMAIL ?? "masteruser@theforexrepublic.com";

  const author = await prisma.user.findUnique({ where: { email: authorEmail } });
  if (!author) return error(`Automation author "${authorEmail}" not found`, 500);

  const feeds = getConfiguredFeeds();
  const all = (await Promise.all(feeds.map((f) => fetchFeedItems(f)))).flat();

  const seen = await prisma.sourceItem.findMany({
    where: { link: { in: all.map((i) => i.link) } },
    select: { link: true },
  });
  const seenLinks = new Set(seen.map((s) => s.link));
  const fresh = all.filter((i) => !seenLinks.has(i.link));

  // Scheduled events give the brief its consensus/prior comparison. A calendar
  // failure must not stop a rate decision going out, so it degrades to no
  // comparison rather than to no article.
  const calendarEvents = await loadCalendarTimeline()
    .then((c) => c.days.flatMap((d) => d.events))
    .catch((e) => {
      console.error("[breaking] calendar unavailable:", e instanceof Error ? e.message : e);
      return [];
    });

  // Only recent items can qualify, so the queue is built over a short window.
  const queue = buildStoryQueue(fresh, gates.minScore, new Date(), gates.maxAgeMinutes / 60);

  const assessed = queue
    .map((cluster) => ({ cluster, assessment: assessBreaking(cluster, calendarEvents, gates) }))
    .filter((a) => a.assessment.eligible)
    .slice(0, perRun);

  const filed: BriefResult[] = [];
  const failed: { title: string; reason: string }[] = [];

  for (const { cluster, assessment } of assessed) {
    try {
      const result = await fileBrief(
        cluster,
        assessment,
        author.id,
        autopublish,
        minDueDiligence
      );
      if (!result) {
        failed.push({ title: cluster.items[0].title, reason: "no category" });
        continue;
      }
      // Claim every item in the cluster so the analytical run does not rewrite
      // the same event, and a later breaking run does not double-publish it.
      await prisma.sourceItem
        .createMany({
          data: cluster.items.map((i) => ({
            link: i.link,
            title: i.title,
            source: i.source,
            articleId: result.articleId,
          })),
          skipDuplicates: true,
        })
        .catch((e) =>
          console.error(
            "[breaking] failed to record source items:",
            e instanceof Error ? e.message : e
          )
        );
      filed.push(result);
    } catch (e) {
      failed.push({
        title: cluster.items[0].title,
        reason: e instanceof Error ? e.message : "brief failed",
      });
    }
  }

  if (filed.some((f) => f.published)) revalidateTag("articles");

  return json({
    ok: true,
    feeds: feeds.length,
    itemsSeen: all.length,
    freshItems: fresh.length,
    candidates: queue.length,
    eligible: assessed.length,
    autopublish,
    gates,
    filed,
    failed,
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

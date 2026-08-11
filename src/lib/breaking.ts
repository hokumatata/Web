/**
 * The breaking-news lane: the one path in this codebase that publishes without
 * waiting for a human.
 *
 * Everything else the agent writes is interpretation, and interpretation needs
 * an editor. A rate decision or a CPI print is different: it is a fact that has
 * either happened or not, the newsmaker has already published it, and its value
 * to a reader decays in minutes. So a narrow class of story gets a short wire
 * brief straight to the site, flagged as breaking and marked as developing, for
 * an editor to expand into a full piece afterwards.
 *
 * "Narrow" is doing real work in that sentence. Every gate below has to pass,
 * and the default when any signal is missing is to fall back to the review
 * queue — never to publish and hope. The gates are:
 *
 *  1. TYPE      — only a data release or a central-bank decision.
 *  2. FRESHNESS — timestamped, and inside the freshness window.
 *  3. SETTLED   — the headline reports what happened, not what might.
 *  4. CONCRETE  — it carries a figure or names an explicit policy decision.
 *  5. CONFIRMED — a first-party release, or independent corroboration.
 *  6. SCORE     — clears a higher newsworthiness bar than the review queue.
 *
 * Gate 5 is the one that matters most, and it is deliberately strict about what
 * counts. One outlet's word is not confirmation; two outlets that both took it
 * from the same wire are, in practice, corroboration enough for a brief that
 * quotes only the figure and says it is developing.
 */

import type { StoryCluster } from "@/lib/cluster";
import type { EconEvent } from "@/lib/econ-calendar";

/** Story types that can ever qualify. Both report settled, checkable facts. */
const PUBLISHABLE_TYPES = new Set(["data-release", "central-bank"]);

/**
 * Headlines that are still speculative. A "preview" or a "could" means the
 * event has not happened, and nothing unpublished-until-it-happens may pass.
 */
const FORWARD_LOOKING =
  /\b(preview|expected|expectations|forecast|outlook|ahead of|before the|what to (expect|watch)|could|might|may not|likely|set to|due (to|for)|poised|braces?|eyes|awaits?|scenarios?)\b/i;

/**
 * A conditional framing, which is a preview however it is worded. Anchored to
 * the start of the headline so that "cut if growth slows" in a quoted statement
 * doesn't disqualify a decision that has already been taken. Note "may" is
 * absent from the pattern above on purpose: it is far more often the month.
 */
const CONDITIONAL = /^\s*(if|should|when)\b/i;

/** A quoted figure: a percentage, a basis-point move, a level, a count. */
const QUOTES_FIGURE = /\d+(\.\d+)?\s?%|\b\d+\s?(bps?|basis points?)\b|\b\d+(\.\d+)?[km]\b|\b\d{1,3}(,\d{3})+\b|\b\d+\.\d+\b/i;

/** An explicit, already-taken policy decision, with no figure required. */
const EXPLICIT_DECISION =
  /\b(holds?|held|keeps?|kept|leaves?|left|raises?|raised|hikes?|hiked|cuts?|lowers?|lowered|trims?|trimmed|maintains?|maintained)\b[^.]{0,40}\b(rate|rates|cash rate|bank rate|policy)\b/i;

export interface BreakingAssessment {
  /** True only when every gate passed. */
  eligible: boolean;
  /** Why it qualified — recorded on the article for the audit trail. */
  reasons: string[];
  /** Which gate refused it. Empty when eligible. */
  blockers: string[];
  /**
   * The scheduled calendar event this print corresponds to, when we can match
   * one. Supplies consensus and prior figures so the brief can say what the
   * number was measured against without inventing the comparison.
   */
  calendarEvent?: EconEvent;
}

export interface BreakingGates {
  /** How recent the newest item must be, in minutes. */
  maxAgeMinutes: number;
  /** Minimum newsworthiness score. Higher than the review-queue gate. */
  minScore: number;
}

export const DEFAULT_GATES: BreakingGates = {
  maxAgeMinutes: 90,
  minScore: 70,
};

export function gatesFromEnv(): BreakingGates {
  return {
    maxAgeMinutes: clamp(
      Number(process.env.BREAKING_MAX_AGE_MINUTES ?? DEFAULT_GATES.maxAgeMinutes),
      10,
      360
    ),
    minScore: clamp(Number(process.env.BREAKING_MIN_SCORE ?? DEFAULT_GATES.minScore), 50, 100),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Decide whether a cluster may be published unreviewed.
 *
 * Returns the reasons as well as the verdict: they are stored on the article so
 * that "why was this live before an editor saw it?" always has an answer.
 */
export function assessBreaking(
  cluster: StoryCluster,
  calendar: EconEvent[] = [],
  gates: BreakingGates = DEFAULT_GATES,
  now = new Date()
): BreakingAssessment {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const headline = cluster.items[0]?.title ?? "";

  // 1. Type.
  if (!PUBLISHABLE_TYPES.has(cluster.storyType)) {
    blockers.push(`story type "${cluster.storyType}" is not a settled-fact story`);
  }

  // 2. Freshness. An undated item is disqualifying rather than merely unhelpful:
  // several central-bank feeds carry years of archive, and an undated archive
  // entry looks exactly like a decision taken ten minutes ago.
  const newest = Math.max(...cluster.items.map((i) => i.publishedAt?.getTime() ?? 0));
  if (!Number.isFinite(newest) || newest <= 0) {
    blockers.push("no publication timestamp on any item");
  } else {
    const ageMinutes = (now.getTime() - newest) / 60_000;
    if (ageMinutes > gates.maxAgeMinutes) {
      blockers.push(`stale: ${Math.round(ageMinutes)} min old (limit ${gates.maxAgeMinutes})`);
    } else {
      reasons.push(`${Math.round(Math.max(0, ageMinutes))} min old`);
    }
  }

  // 3. Settled, not speculative.
  if (FORWARD_LOOKING.test(headline) || CONDITIONAL.test(headline)) {
    blockers.push("headline is forward-looking, so the event has not happened yet");
  }

  // 4. Concrete.
  const hasFigure = QUOTES_FIGURE.test(headline);
  const hasDecision = EXPLICIT_DECISION.test(headline);
  if (hasFigure) reasons.push("quotes a figure");
  if (hasDecision) reasons.push("names an explicit policy decision");
  if (!hasFigure && !hasDecision) {
    blockers.push("headline reports neither a figure nor an explicit decision");
  }

  // 5. Confirmed.
  if (cluster.hasPrimarySource) {
    reasons.push("first-party release from the newsmaker");
  } else if (cluster.sources.length >= 2) {
    reasons.push(`corroborated by ${cluster.sources.length} outlets`);
  } else {
    blockers.push("single secondary outlet, uncorroborated");
  }

  // 6. Score.
  if (cluster.score < gates.minScore) {
    blockers.push(`score ${cluster.score} below breaking threshold ${gates.minScore}`);
  }

  const calendarEvent = matchCalendarEvent(headline, calendar, now);
  if (calendarEvent) {
    reasons.push(`matches scheduled calendar event "${calendarEvent.event}"`);
  }

  return { eligible: blockers.length === 0, reasons, blockers, calendarEvent };
}

/**
 * Find the scheduled release a headline is reporting.
 *
 * Only events whose scheduled time has already passed are considered: a match
 * against something still in the future would mean the headline is a preview,
 * whatever else it looks like. Matching is on distinctive words shared between
 * the event name and the headline, which is enough to tell "Core CPI y/y" from
 * "Retail Sales" without needing an exact-name table per provider.
 */
export function matchCalendarEvent(
  headline: string,
  calendar: EconEvent[],
  now = new Date(),
  windowHours = 6
): EconEvent | undefined {
  const words = distinctiveWords(headline);
  if (words.size === 0) return undefined;

  const from = now.getTime() - windowHours * 3_600_000;
  let best: { event: EconEvent; shared: number } | undefined;

  for (const event of calendar) {
    const at = new Date(event.at).getTime();
    if (at > now.getTime() || at < from) continue;

    const eventWords = distinctiveWords(event.event);
    if (eventWords.size === 0) continue;
    let shared = 0;
    eventWords.forEach((w) => {
      if (words.has(w)) shared++;
    });
    // Two shared distinctive words, or one when that is all the event name has
    // ("GDP", "Unemployment Rate" minus its stopword).
    const enough = shared >= 2 || (shared === 1 && eventWords.size === 1);
    if (enough && (!best || shared > best.shared)) best = { event, shared };
  }

  return best?.event;
}

const CALENDAR_STOPWORDS = new Set([
  "the", "and", "for", "rate", "index", "data", "report", "month", "quarter",
  "final", "prelim", "preliminary", "revised", "annual", "monthly", "yoy", "mom",
  "qoq", "sa", "nsa", "usd", "eur", "gbp", "jpy",
]);

function distinctiveWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s/]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !CALENDAR_STOPWORDS.has(w))
  );
}

/**
 * The comparison figures for a print, drawn from the calendar rather than from
 * the model. Returned as source material, so the brief can only say "against a
 * 3.4% consensus" when a scheduled event actually recorded that consensus.
 */
export function formatCalendarContext(event: EconEvent): string {
  const rows = [
    `Event: ${event.event} (${event.currency})`,
    `Scheduled: ${event.at} UTC`,
    `Impact: ${event.impact}`,
    `Consensus: ${event.consensus ?? "not published"}`,
    `Previous: ${event.previous ?? "not published"}`,
  ];
  return `### Scheduled calendar entry for this release (authoritative)\nUse these figures for the consensus and prior comparison, and no others. If a field says "not published", do not state a value for it.\n${rows.join(
    "\n"
  )}`;
}

/**
 * Story clustering, newsworthiness scoring and story-type detection.
 *
 * All three run locally with no model call, for two reasons: they are cheap
 * pattern problems that do not need a language model, and doing them for free
 * means we can afford to run the scan step every few minutes.
 *
 * Clustering is the change that turns the agent from a paraphraser into a
 * reporter: several outlets covering the same event become ONE article that
 * triangulates them, rather than several near-duplicates of individual stories.
 */

import type { FeedItem } from "@/lib/sources";
import type { StoryType } from "@/lib/house-style";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with",
  "from", "by", "as", "is", "are", "was", "were", "be", "been", "being", "it", "its",
  "this", "that", "these", "those", "will", "would", "could", "should", "may", "might",
  "has", "have", "had", "not", "no", "up", "down", "out", "over", "after", "before",
  "amid", "says", "said", "new", "more", "most", "than", "into", "about", "how", "why",
  "what", "when", "who", "s", "t", "vs", "you", "your", "we", "his", "her", "their",
]);

/** Tokens that carry topical meaning, lowercased and de-duplicated. */
function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9$%./\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[-.]+|[-.]+$/g, ""))
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
  return new Set(tokens);
}

/**
 * Overlap coefficient (shared / smaller set) rather than Jaccard.
 *
 * Feed summaries vary from one line to several paragraphs, and Jaccard punishes
 * that asymmetry hard enough that two outlets covering the same event score as
 * unrelated. Overlap asks the question we actually care about: is the shorter
 * headline's subject matter contained in the other's?
 */
function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  a.forEach((t) => {
    if (b.has(t)) shared++;
  });
  return shared / Math.min(a.size, b.size);
}

export interface StoryCluster {
  /** The feed items covering this story, most recent first. */
  items: FeedItem[];
  /** Distinct outlets in the cluster. */
  sources: string[];
  /** Newsworthiness score, 0-100. */
  score: number;
  /** Detected story type, used to select the article outline. */
  storyType: StoryType;
  /** Instrument slug when the story is clearly about one instrument. */
  instrumentSlug?: string;
  /** Short explanation of the score, surfaced to the human reviewer. */
  scoreReason: string;
}

/**
 * Group items covering the same underlying event. Greedy single-pass linkage on
 * headline/summary token overlap — the corpus per run is small (tens of items),
 * so an O(n^2) comparison is comfortably cheap and keeps behaviour predictable.
 */
export function clusterItems(items: FeedItem[], threshold = 0.5): FeedItem[][] {
  // Headline-only signatures: the headline states the event, whereas summaries
  // add boilerplate and outlet-specific framing that blurs the comparison.
  const tokenSets = items.map((i) => tokenize(i.title));
  const clusters: { indices: number[]; tokens: Set<string> }[] = [];

  for (let i = 0; i < items.length; i++) {
    let best = -1;
    let bestScore = threshold;
    for (let c = 0; c < clusters.length; c++) {
      const sim = overlap(tokenSets[i], clusters[c].tokens);
      if (sim >= bestScore) {
        bestScore = sim;
        best = c;
      }
    }
    if (best === -1) {
      clusters.push({ indices: [i], tokens: new Set(tokenSets[i]) });
    } else {
      clusters[best].indices.push(i);
      // Widen the cluster's token profile so later items can match the group.
      tokenSets[i].forEach((t) => clusters[best].tokens.add(t));
    }
  }

  return clusters.map((c) =>
    c.indices
      .map((idx) => items[idx])
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
  );
}

/**
 * Topics our readers actually trade, weighted by how much they move markets.
 * A story that matches none of these is almost certainly not for us.
 */
const TOPIC_WEIGHTS: { pattern: RegExp; weight: number; label: string }[] = [
  { pattern: /\b(fomc|federal reserve|\bfed\b|powell|rate (cut|hike|decision)|monetary policy)\b/i, weight: 26, label: "Fed/policy" },
  { pattern: /\b(ecb|boe|bank of england|boj|bank of japan|snb|rba|bank of canada|pboc)\b/i, weight: 22, label: "central bank" },
  { pattern: /\b(cpi|inflation|pce|ppi|core inflation|deflation)\b/i, weight: 24, label: "inflation" },
  { pattern: /\b(nonfarm|non-farm|payrolls|nfp|unemployment|employment|jobless claims|jobs report)\b/i, weight: 22, label: "labour data" },
  { pattern: /\b(gdp|recession|pmi|retail sales|consumer confidence|durable goods)\b/i, weight: 16, label: "growth data" },
  { pattern: /\b(treasury|yields?|bond market|curve|10-year)\b/i, weight: 16, label: "rates" },
  { pattern: /\b(dollar|dxy|greenback|eur\/?usd|gbp\/?usd|usd\/?jpy|aud\/?usd|usd\/?cad|yen|euro|sterling)\b/i, weight: 20, label: "FX" },
  { pattern: /\b(gold|xau|silver|xag|bullion)\b/i, weight: 18, label: "metals" },
  { pattern: /\b(oil|crude|wti|brent|opec)\b/i, weight: 14, label: "energy" },
  { pattern: /\b(bitcoin|btc|ethereum|eth|solana|xrp|crypto|stablecoin|etf inflows?)\b/i, weight: 18, label: "crypto" },
  { pattern: /\b(sec|cftc|regulation|regulatory|lawsuit|congress|senate|bill|tariff|sanction)\b/i, weight: 12, label: "policy/regulation" },
  { pattern: /\b(earnings|guidance|revenue|profit|quarterly results|eps)\b/i, weight: 10, label: "earnings" },
  { pattern: /\b(s&p 500|nasdaq|dow|equities|stock market|shares)\b/i, weight: 10, label: "equities" },
];

/** Markers of content that is not markets journalism. */
const JUNK_PATTERNS: { pattern: RegExp; penalty: number; label: string }[] = [
  { pattern: /\b(top|best|worst)\s+\d+\b/i, penalty: 45, label: "listicle" },
  { pattern: /\branked by\b|\brankings?\b/i, penalty: 35, label: "ranking" },
  { pattern: /\bhow to\b|\bguide to\b|\btips for\b|\bexplained for beginners\b/i, penalty: 30, label: "how-to" },
  { pattern: /\b(deal|discount|coupon|sale|shopping|prime day|black friday)\b/i, penalty: 40, label: "commerce" },
  { pattern: /\b(recipe|horoscope|celebrity|royal family|dating|weight loss)\b/i, penalty: 60, label: "off-topic" },
  { pattern: /\b(sponsored|press release|partner content|advertorial)\b/i, penalty: 40, label: "sponsored" },
  { pattern: /\b(apparel|fashion|sneaker|restaurant chain|theme park)\b/i, penalty: 30, label: "consumer/off-topic" },
  { pattern: /\bearnings call transcript\b/i, penalty: 45, label: "raw transcript" },
  { pattern: /\b(price prediction|to the moon|will explode|100x|next big)\b/i, penalty: 35, label: "hype/shill" },
];

/**
 * Story-type detection from the HEADLINE, which is what states the story.
 *
 * Summaries are deliberately excluded: they mention adjacent topics (a stray
 * reference to inflation in a feature piece) and routinely pushed stories into
 * the wrong outline — which is exactly what produced technical sections on macro
 * copy and "preview" framing on data that had already printed.
 *
 * Order matters; checks run from most to least specific.
 */
export function detectStoryType(headline: string): StoryType {
  const t = headline.toLowerCase();

  if (/\bweek ahead\b|\bthe week in\b|\bwhat to watch (this|next) week\b/.test(t)) {
    return "week-ahead";
  }

  // Session wraps are round-ups of many things, not a piece about one event.
  if (/\b(wrap|recap|round-?up|closing bell|session summary|markets? today)\b/.test(t)) {
    return "general";
  }

  // Central-bank framing outranks topic keywords: a policymaker talking about
  // inflation is a central-bank story, not a data release.
  const isCentralBank =
    /^\s*(the\s+)?(fed|fomc|ecb|boe|boj|snb|rba|pboc|bank of [a-z]+)('s)?\b/.test(t) ||
    /\b(powell|lagarde|bailey|ueda|barkin|waller|bostic|williams|kashkari|schnabel|villeroy)\b/.test(t) ||
    /\b(rate decision|interest rate decision|policy (meeting|decision|statement)|monetary policy|minutes|bank rate|rate (cut|hike)s?|dot plot)\b/.test(t);
  if (isCentralBank) return "central-bank";

  const isDataTopic =
    /\b(cpi|inflation|pce|ppi|payrolls|nfp|non-?farm|unemployment|employment change|jobless claims|jobs report|gdp|pmi|ism|retail sales|durable goods|consumer confidence|trade balance)\b/.test(t);

  if (isDataTopic) {
    // A release always quotes the print, as a figure or a "vs" comparison. If the
    // headline quotes no number, the data has not landed yet.
    const quotesPrint =
      /\bvs\.?\b|\d+(\.\d+)?%|[+-]?\d+(\.\d+)?k\b|\b(rose|fell|climbed|dropped|came in|printed|rises|falls|held|accelerated|slowed|beat|missed|unchanged|dips?|jumps?|eases?)\b/.test(
        t
      );
    return quotesPrint ? "data-release" : "data-preview";
  }

  if (/\b(forecast|price analysis|technical (analysis|outlook)|outlook|support|resistance)\b/.test(t)) {
    return "price-forecast";
  }

  // A move is only the story when the headline names the instrument that moved.
  const isMove =
    /\b(surges?|plunges?|jumps?|sinks?|rallies|rallied|slides?|slips?|tumbles?|soars?|climbs?|hits?|tags?|touches|breaks? (above|below)|record high|all-time high|extends? (gains|losses))\b/.test(
      t
    );
  if (isMove && detectInstrument(headline)) return "market-move";

  if (/\b(sec|cftc|regulation|regulatory|lawsuit|bill|senate|congress|tariff|sanction|\bban\b|approves?)\b/.test(t)) {
    return "regulation";
  }
  if (/\b(earnings|quarterly results|revenue|guidance|eps|profit|beats estimates|misses estimates)\b/.test(t)) {
    return "earnings";
  }

  return "general";
}

/** Instrument slugs detectable from prose, for attaching computed technicals. */
const INSTRUMENT_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /\beur\/?usd\b|\beuro\b/i, slug: "eurusd" },
  { pattern: /\bgbp\/?usd\b|\bsterling\b|\bpound\b/i, slug: "gbpusd" },
  { pattern: /\busd\/?jpy\b|\byen\b/i, slug: "usdjpy" },
  { pattern: /\baud\/?usd\b|\baussie\b/i, slug: "audusd" },
  { pattern: /\busd\/?cad\b|\bloonie\b/i, slug: "usdcad" },
  { pattern: /\bdxy\b|\bdollar index\b/i, slug: "dxy" },
  { pattern: /\bgold\b|\bxau\b|\bbullion\b/i, slug: "xauusd" },
  { pattern: /\bsilver\b|\bxag\b/i, slug: "xagusd" },
  { pattern: /\b(wti|brent|crude oil)\b/i, slug: "wti" },
  { pattern: /\bbitcoin\b|\bbtc\b/i, slug: "btcusd" },
  { pattern: /\bethereum\b|\beth\b/i, slug: "ethusd" },
  { pattern: /\bsolana\b|\bsol\b/i, slug: "solusd" },
  { pattern: /\bs&p 500\b|\bspx\b/i, slug: "spx" },
  { pattern: /\bnasdaq\b/i, slug: "ndx" },
];

export function detectInstrument(text: string): string | undefined {
  return INSTRUMENT_PATTERNS.find((p) => p.pattern.test(text))?.slug;
}

/**
 * Score a cluster's newsworthiness for a forex/crypto/macro readership.
 *
 * The score decides what gets written, so it is the main quality *and* cost
 * control: junk never reaches a paid model call. Corroboration across outlets
 * is rewarded because it both signals importance and gives the writer more to
 * synthesise.
 */
export function scoreCluster(items: FeedItem[], now = new Date()): StoryCluster {
  const text = items.map((i) => `${i.title} ${i.summary}`).join(" \n ");
  const sources = Array.from(new Set(items.map((i) => i.source)));

  const reasons: string[] = [];
  let score = 20; // Baseline: a markets feed item is mildly relevant by default.

  // Topicality — best two matches only, so a keyword-stuffed headline can't run away.
  const hits = TOPIC_WEIGHTS.filter((t) => t.pattern.test(text)).sort((a, b) => b.weight - a.weight);
  for (const hit of hits.slice(0, 2)) {
    score += hit.weight;
    reasons.push(hit.label);
  }
  if (hits.length === 0) {
    score -= 25;
    reasons.push("no core topic match");
  }

  // Corroboration across outlets.
  if (sources.length > 1) {
    score += Math.min(20, (sources.length - 1) * 12);
    reasons.push(`${sources.length} outlets`);
  }

  // Recency — a six-hour-old headline is worth less than a fresh one.
  const newest = Math.max(...items.map((i) => i.publishedAt?.getTime() ?? 0));
  if (newest > 0) {
    const ageHours = (now.getTime() - newest) / 3_600_000;
    if (ageHours <= 2) {
      score += 10;
      reasons.push("breaking");
    } else if (ageHours >= 12) {
      score -= 12;
      reasons.push("stale");
    }
  }

  // Hard numbers in the headline usually mean there is something to report.
  if (/\d+(\.\d+)?%|\$\d|\b\d{2,}k\b/i.test(items[0]?.title ?? "")) {
    score += 6;
    reasons.push("quantified");
  }

  // Thin sourcing: a single short blurb gives the writer nothing to work with,
  // and padding it out to article length is precisely how filler gets produced.
  const material = items.reduce((n, i) => n + i.title.length + i.summary.length, 0);
  if (sources.length === 1 && material < 400) {
    score -= 15;
    reasons.push("thin sourcing");
  }

  for (const junk of JUNK_PATTERNS) {
    if (junk.pattern.test(text)) {
      score -= junk.penalty;
      reasons.push(`penalty: ${junk.label}`);
    }
  }

  const storyType = detectStoryType(items[0]?.title ?? "");
  // Prefer the headline's instrument, falling back to the body for e.g. a wrap
  // that names the pair only in the summary.
  const instrumentSlug = detectInstrument(items[0]?.title ?? "") ?? detectInstrument(text);

  return {
    items,
    sources,
    score: Math.max(0, Math.min(100, Math.round(score))),
    storyType,
    instrumentSlug,
    scoreReason: reasons.join(", ") || "baseline",
  };
}

/**
 * Full pipeline: drop stale items, cluster the rest, score every cluster, and
 * return them best-first with anything below the threshold removed.
 *
 * The age filter is not a nicety. Central-bank feeds carry months of archive, so
 * without it a first run would cheerfully "break" a rate decision from three
 * meetings ago. Items with no publish date are kept, since several feeds omit
 * it, and are judged on the other signals instead.
 */
export function buildStoryQueue(
  items: FeedItem[],
  minScore = 45,
  now = new Date(),
  maxAgeHours = 48
): StoryCluster[] {
  const cutoff = now.getTime() - maxAgeHours * 3_600_000;
  const recent = items.filter((i) => !i.publishedAt || i.publishedAt.getTime() >= cutoff);

  return clusterItems(recent)
    .map((cluster) => scoreCluster(cluster, now))
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

/**
 * Exercise the breaking-news gates without model calls or database writes.
 *
 * Part one is a fixture suite: the cases that must publish, and — more
 * importantly — the near-misses that must not. Part two runs the real gates over
 * the live feeds and prints what would have gone out in the last window, so the
 * thresholds can be judged against actual headlines rather than invented ones.
 *
 *   npx tsx scripts/breaking-dry-run.ts
 */

import { assessBreaking, matchCalendarEvent, gatesFromEnv } from "../src/lib/breaking";
import { findBreakingViolations } from "../src/lib/house-style";
import { findUnsourcedFigures } from "../src/lib/ai";
import { buildStoryQueue, type StoryCluster } from "../src/lib/cluster";
import { getConfiguredFeeds, fetchFeedItems, type FeedItem } from "../src/lib/sources";
import type { EconEvent } from "../src/lib/econ-calendar";
import type { StoryType } from "../src/lib/house-style";

const NOW = new Date("2026-08-12T12:00:00Z");

function item(source: string, title: string, ageMinutes: number | null): FeedItem {
  return {
    source,
    title,
    link: `https://example.com/${encodeURIComponent(title.slice(0, 30))}`,
    summary: title,
    publishedAt: ageMinutes === null ? null : new Date(NOW.getTime() - ageMinutes * 60_000),
    beat: "macro",
    primary: source === "Reserve Bank of Australia" || source === "BLS",
  };
}

function cluster(
  storyType: StoryType,
  items: FeedItem[],
  score = 80,
  hasPrimarySource = items.some((i) => i.primary)
): StoryCluster {
  return {
    items,
    sources: Array.from(new Set(items.map((i) => i.source))),
    score,
    storyType,
    scoreReason: "fixture",
    beat: "macro",
    hasPrimarySource,
  };
}

const CASES: { name: string; cluster: StoryCluster; expect: boolean }[] = [
  {
    name: "first-party rate decision, 10 min old",
    expect: true,
    cluster: cluster("central-bank", [
      item("Reserve Bank of Australia", "RBA holds cash rate at 4.35%", 10),
    ]),
  },
  {
    name: "CPI print corroborated by two outlets",
    expect: true,
    cluster: cluster("data-release", [
      item("ForexLive", "US core CPI rises 0.3% in July", 20),
      item("CNBC Economy", "Core inflation up 0.3% last month", 25),
    ]),
  },
  {
    name: "preview of the same decision",
    expect: false,
    cluster: cluster("data-preview", [
      item("ForexLive", "RBA preview: cash rate expected to stay at 4.35%", 10),
    ]),
  },
  {
    name: "settled wording but only one secondary outlet",
    expect: false,
    cluster: cluster("data-release", [item("ForexLive", "US core CPI rises 0.3% in July", 20)]),
  },
  {
    name: "confirmed but stale",
    expect: false,
    cluster: cluster("central-bank", [
      item("Reserve Bank of Australia", "RBA holds cash rate at 4.35%", 600),
    ]),
  },
  {
    name: "undated archive entry",
    expect: false,
    cluster: cluster("central-bank", [
      item("Reserve Bank of Australia", "RBA holds cash rate at 4.35%", null),
    ]),
  },
  {
    name: "no figure and no explicit decision",
    expect: false,
    cluster: cluster("central-bank", [
      item("Reserve Bank of Australia", "Statement by the Governor on monetary policy", 10),
    ]),
  },
  {
    name: "scenario piece",
    expect: false,
    cluster: cluster("data-release", [
      item("ForexLive", "If core CPI tops 3.4%, the dollar could rally", 10),
      item("CNBC Economy", "What a 3.4% CPI print might mean for the Fed", 12),
    ]),
  },
  {
    name: "confirmed print below the breaking score bar",
    expect: false,
    cluster: cluster(
      "data-release",
      [item("BLS", "US core CPI rises 0.3% in July", 15)],
      55
    ),
  },
  {
    name: "May in the headline is a month, not a hedge",
    expect: true,
    cluster: cluster("data-release", [
      item("BLS", "US core CPI rose 0.3% in May", 15),
    ]),
  },
];

const CALENDAR: EconEvent[] = [
  {
    at: new Date(NOW.getTime() - 30 * 60_000).toISOString(),
    currency: "USD",
    event: "Core CPI m/m",
    impact: "high",
    consensus: "0.3%",
    previous: "0.2%",
    actual: null,
  },
  {
    at: new Date(NOW.getTime() + 4 * 3_600_000).toISOString(),
    currency: "USD",
    event: "Retail Sales m/m",
    impact: "high",
    consensus: "0.4%",
    previous: "0.1%",
    actual: null,
  },
];

function fixtures(): number {
  let failures = 0;
  console.log("=== GATE FIXTURES ===");
  for (const c of CASES) {
    const a = assessBreaking(c.cluster, CALENDAR, gatesFromEnv(), NOW);
    const ok = a.eligible === c.expect;
    if (!ok) failures++;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${c.name}\n     eligible=${a.eligible} expected=${c.expect}` +
        `\n     reasons: ${a.reasons.join("; ") || "none"}` +
        `\n     blockers: ${a.blockers.join("; ") || "none"}`
    );
  }

  console.log("\n=== CALENDAR MATCHING ===");
  const matched = matchCalendarEvent("US core CPI rises 0.3% in July", CALENDAR, NOW);
  const future = matchCalendarEvent("US retail sales climb 0.4%", CALENDAR, NOW);
  const unrelated = matchCalendarEvent("Bitcoin tops $70,000", CALENDAR, NOW);
  const checks: [string, boolean][] = [
    ["past CPI release matches", matched?.event === "Core CPI m/m"],
    ["future release does not match", future === undefined],
    ["unrelated headline does not match", unrelated === undefined],
  ];
  for (const [name, pass] of checks) {
    if (!pass) failures++;
    console.log(`${pass ? "ok  " : "FAIL"} ${name}`);
  }

  console.log("\n=== BRIEF VALIDATION ===");
  const goodBrief =
    "# RBA holds cash rate at 4.35%\n\n" +
    "The Reserve Bank of Australia left its cash rate unchanged at 4.35% on Tuesday, the central bank said in a statement following its policy meeting. ".repeat(
      6
    );
  const badBrief =
    "# RBA holds\n\n## Technical Analysis\nSupport sits at 0.6540 and resistance at 0.6620. " +
    "The RSI is elevated. ".repeat(20);
  const briefChecks: [string, boolean][] = [
    ["clean brief passes", findBreakingViolations(goodBrief).length === 0],
    ["technical brief is rejected", findBreakingViolations(badBrief).length > 0],
    [
      "unsourced figure is caught",
      findUnsourcedFigures("Core CPI rose 0.7% on the month.", "Core CPI rose 0.3% on the month.")
        .length > 0,
    ],
    [
      "sourced figure passes",
      findUnsourcedFigures("Core CPI rose 0.3% on the month.", "Core CPI rose 0.3% on the month.")
        .length === 0,
    ],
  ];
  for (const [name, pass] of briefChecks) {
    if (!pass) failures++;
    console.log(`${pass ? "ok  " : "FAIL"} ${name}`);
  }

  return failures;
}

async function live() {
  const gates = gatesFromEnv();
  const feeds = getConfiguredFeeds();
  const items = (await Promise.all(feeds.map((f) => fetchFeedItems(f)))).flat();
  const queue = buildStoryQueue(items, gates.minScore, new Date(), gates.maxAgeMinutes / 60);

  console.log(
    `\n=== LIVE FEEDS (last ${gates.maxAgeMinutes} min) ===\n` +
      `${items.length} items, ${queue.length} clusters above score ${gates.minScore}`
  );

  let eligible = 0;
  for (const c of queue) {
    const a = assessBreaking(c, [], gates);
    if (a.eligible) eligible++;
    console.log(
      `\n${a.eligible ? "WOULD PUBLISH" : "held"} [${c.score}] ${c.storyType} | ${c.sources.join(" + ")}` +
        `\n  ${c.items[0].title.slice(0, 110)}` +
        `\n  ${a.eligible ? a.reasons.join("; ") : a.blockers.join("; ")}`
    );
  }
  console.log(`\neligible for the wire: ${eligible}/${queue.length}`);
}

async function main() {
  const failures = fixtures();
  if (process.argv.includes("--fixtures-only")) {
    if (failures > 0) process.exit(1);
    return;
  }
  await live().catch((e) => console.error("live pass failed:", e instanceof Error ? e.message : e));
  if (failures > 0) {
    console.error(`\n${failures} fixture check(s) failed`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

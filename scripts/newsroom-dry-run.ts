/**
 * Dry-run the newsroom scan stage against the live feeds, with no model calls
 * and no database writes.
 *
 * Prints the clusters it would write, the clusters it rejected and why, and the
 * computed technical snapshot for one instrument. Use it to sanity-check the
 * scoring thresholds after changing feeds or weights.
 *
 *   npx tsx scripts/newsroom-dry-run.ts
 */

import { buildStoryQueue, clusterItems, scoreCluster } from "../src/lib/cluster";
import { getConfiguredFeeds, fetchFeedItems } from "../src/lib/sources";
import { allowsTechnicals } from "../src/lib/house-style";
import { computeTechnicals, findInstrument, formatTechnicalBlock } from "../src/lib/technicals";

async function main() {
  const feeds = getConfiguredFeeds();
  const results = await Promise.all(feeds.map((f) => fetchFeedItems(f)));
  feeds.forEach((f, i) => console.log(`feed ${f.source}: ${results[i].length} items`));

  const items = results.flat();
  console.log(`\ntotal items: ${items.length}`);

  // All clusters, for visibility into what the gate rejects.
  const scored = clusterItems(items)
    .map((c) => scoreCluster(c))
    .sort((a, b) => b.score - a.score);

  // What the cron would actually write: fresh, clustered, above threshold.
  const queue = buildStoryQueue(items);
  const multi = queue.filter((c) => c.sources.length > 1);
  console.log(
    `clusters: ${scored.length} | passing the gate: ${queue.length} | multi-outlet: ${multi.length}`
  );

  console.log("\n=== TOP 12 (would be written, best first) ===");
  for (const c of queue.slice(0, 12)) {
    console.log(
      `\n[${c.score}] ${c.storyType}${c.instrumentSlug ? ` (${c.instrumentSlug})` : ""} | ${c.sources.join(" + ")}`
    );
    console.log(`  why: ${c.scoreReason}`);
    for (const i of c.items) console.log(`  - ${i.source}: ${i.title.slice(0, 100)}`);
  }

  console.log("\n=== BOTTOM 8 (rejected) ===");
  for (const c of scored.slice(-8)) {
    console.log(`[${c.score}] ${c.items[0].title.slice(0, 90)}  <-- ${c.scoreReason}`);
  }

  const chartLed = queue.find((c) => allowsTechnicals(c.storyType) && c.instrumentSlug);
  const instrument = findInstrument(chartLed?.instrumentSlug ?? "xauusd");
  if (instrument) {
    console.log(`\n=== COMPUTED TECHNICALS: ${instrument.label} ===`);
    console.log(formatTechnicalBlock(await computeTechnicals(instrument)));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

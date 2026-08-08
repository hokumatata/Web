/**
 * Generate sample articles from the live feeds without touching the database.
 *
 * Writes each draft to /tmp so the output can be read as a reader would see it,
 * and prints the due-diligence verdict. Use it to judge voice and structure
 * after changing the prompt or the story-type outlines.
 *
 *   npx tsx scripts/newsroom-sample.ts [count]
 */

import { writeFileSync } from "node:fs";
import { buildStoryQueue, type StoryCluster } from "../src/lib/cluster";
import { getConfiguredFeeds, fetchFeedItems } from "../src/lib/sources";
import { allowsTechnicals, findStyleViolations } from "../src/lib/house-style";
import {
  computeTechnicals,
  findInstrument,
  formatTechnicalBlock,
  findUnsupportedLevels,
} from "../src/lib/technicals";
import { generateArticleDraft, runDueDiligence, type ArticleSources } from "../src/lib/ai";

async function sample(cluster: StoryCluster, index: number) {
  let technicalBlock: string | undefined;
  let storyType = cluster.storyType;
  let snapshot: Awaited<ReturnType<typeof computeTechnicals>> | null = null;

  if (allowsTechnicals(storyType) && cluster.instrumentSlug) {
    const instrument = findInstrument(cluster.instrumentSlug);
    if (instrument) {
      try {
        snapshot = await computeTechnicals(instrument);
        technicalBlock = formatTechnicalBlock(snapshot);
      } catch {
        storyType = "general";
      }
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
  };

  const draft = await generateArticleDraft(sources);
  const dd = await runDueDiligence(draft, sources).catch(() => null);

  const words = draft.body.split(/\s+/).length;
  const headings = draft.body.match(/^##\s+.+$/gm) ?? [];
  const hasTechSection = /technical/i.test(headings.join(" "));

  console.log(`\n${"=".repeat(70)}`);
  console.log(`SAMPLE ${index} — ${storyType} | outlets: ${cluster.sources.join(" + ")}`);
  console.log(`TITLE:   ${draft.title}`);
  console.log(`EXCERPT: ${draft.excerpt}`);
  console.log(`words=${words} category=${draft.categorySlug} tags=${draft.tags.join(", ")}`);
  console.log(`headings: ${headings.map((h) => h.replace(/^##\s+/, "")).join(" | ")}`);
  console.log(
    `technical section present: ${hasTechSection} (allowed: ${allowsTechnicals(storyType)})`
  );
  console.log(`style violations: ${findStyleViolations(draft.body).join("; ") || "none"}`);
  if (snapshot) {
    console.log(`unverified levels: ${findUnsupportedLevels(draft.body, snapshot).join("; ") || "none"}`);
  }
  console.log(`due diligence: ${dd?.verdict} ${dd?.score} | flags: ${dd?.flags.join("; ") || "none"}`);

  const path = `/tmp/sample-${index}-${storyType}.md`;
  writeFileSync(path, draft.body);
  console.log(`body written to ${path}`);
}

async function main() {
  const count = Number(process.argv[2] ?? 3);
  const feeds = getConfiguredFeeds();
  const items = (await Promise.all(feeds.map((f) => fetchFeedItems(f)))).flat();
  const queue = buildStoryQueue(items);
  console.log(`queue: ${queue.length} clusters, sampling ${count}`);

  // Spread the sample across distinct story types to exercise several outlines.
  const byType = new Map<string, StoryCluster>();
  for (const c of queue) if (!byType.has(c.storyType)) byType.set(c.storyType, c);
  const picks = Array.from(byType.values()).slice(0, count);

  for (let i = 0; i < picks.length; i++) {
    await sample(picks[i], i + 1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

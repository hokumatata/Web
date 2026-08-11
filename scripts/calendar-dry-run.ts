/**
 * No-write check that the economic calendar reads real data end to end.
 *
 * Usage: npx tsx scripts/calendar-dry-run.ts
 */
import { fetchEconCalendar, upcomingHighImpact } from "../src/lib/econ-calendar";
import { loadCalendarTimeline } from "../src/lib/econ-calendar-store";

async function main() {
  const calendar = await fetchEconCalendar();
  const feedDown = calendar.days.length === 0;

  if (feedDown) {
    // Expected under rate limiting (HTTP 429). The archive should carry the
    // page, so keep going and report the timeline rather than bailing.
    console.warn("FEED UNAVAILABLE — checking whether the archive covers for it.");
  }

  const all = calendar.days.flatMap((d) => d.events);
  const byImpact = all.reduce<Record<string, number>>((acc, e) => {
    acc[e.impact] = (acc[e.impact] ?? 0) + 1;
    return acc;
  }, {});

  console.log(
    `days: ${calendar.days.length} | events: ${all.length} | ` +
      `impact: ${JSON.stringify(byImpact)}`
  );
  console.log(
    `with consensus: ${all.filter((e) => e.consensus).length} | ` +
      `with previous: ${all.filter((e) => e.previous).length} | ` +
      `currencies: ${Array.from(new Set(all.map((e) => e.currency))).sort().join(",")}`
  );

  console.log("\n=== PER DAY ===");
  for (const day of calendar.days) {
    const high = day.events.filter((e) => e.impact === "high").length;
    console.log(`${day.date}: ${day.events.length} events (${high} high)`);
  }

  console.log("\n=== HIGH IMPACT THIS WEEK ===");
  for (const ev of all.filter((e) => e.impact === "high")) {
    console.log(
      `${ev.at.slice(0, 16).replace("T", " ")}Z ${ev.currency.padEnd(6)} ${ev.event} ` +
        `| cons ${ev.consensus ?? "—"} | prev ${ev.previous ?? "—"}`
    );
  }

  console.log("\n=== TIMELINE (archive + live) ===");
  try {
    const timeline = await loadCalendarTimeline();
    const today = new Date().toISOString().slice(0, 10);
    const past = timeline.days.filter((d) => d.date < today);
    const future = timeline.days.filter((d) => d.date > today);
    console.log(
      `past days: ${past.length} | today: ${
        timeline.days.some((d) => d.date === today) ? "present" : "absent"
      } | upcoming days: ${future.length} | ` +
        `oldest: ${timeline.days[0]?.date ?? "—"}`
    );
  } catch (e) {
    console.log(`archive unavailable (${e instanceof Error ? e.message : e})`);
    console.log("the page falls back to the live week only");
  }

  const upcoming = upcomingHighImpact(calendar, 36);
  console.log(`\n=== WRITEABLE PREVIEWS (next 36h, high impact): ${upcoming.length} ===`);
  for (const ev of upcoming) {
    console.log(
      `${ev.at.slice(0, 16).replace("T", " ")}Z ${ev.currency} ${ev.event} ` +
        `| cons ${ev.consensus ?? "—"} | prev ${ev.previous ?? "—"}`
    );
  }

  const fabricated = all.filter((e) => e.actual !== null);
  console.log(`\nevents carrying an actual (must be 0): ${fabricated.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

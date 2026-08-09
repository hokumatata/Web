/**
 * No-write check that the economic calendar reads real data end to end.
 *
 * Usage: npx tsx scripts/calendar-dry-run.ts
 */
import { fetchEconCalendar, upcomingHighImpact } from "../src/lib/econ-calendar";

async function main() {
  const calendar = await fetchEconCalendar();

  if (calendar.days.length === 0) {
    console.error("FEED UNAVAILABLE — the page would render its unavailable state.");
    process.exit(1);
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

/**
 * Archive the current week's economic calendar into the database.
 *
 * The scheduled cron already does this on every run; this is for a manual
 * backfill or to verify the sync in isolation.
 *
 * Usage: npx tsx scripts/calendar-sync.ts
 */
import { syncEconCalendar, loadCalendarTimeline } from "../src/lib/econ-calendar-store";

async function main() {
  const result = await syncEconCalendar();
  console.log(`fetched: ${result.fetched} | written: ${result.written}`);

  const timeline = await loadCalendarTimeline();
  const today = new Date().toISOString().slice(0, 10);
  console.log(
    `timeline days: ${timeline.days.length} | ` +
      `past: ${timeline.days.filter((d) => d.date < today).length} | ` +
      `upcoming: ${timeline.days.filter((d) => d.date > today).length} | ` +
      `oldest: ${timeline.days[0]?.date ?? "—"}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db");
    await prisma.$disconnect();
  });

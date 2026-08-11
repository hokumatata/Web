/**
 * Persistence for the economic calendar.
 *
 * The upstream feed only exposes the current week, so the calendar timeline
 * cannot show history from the feed alone. Every sync upserts the week it
 * fetched into `EconomicEvent`; the archive then grows a week at a time and the
 * timeline reads its past section from there.
 *
 * Reads never fail the page: if the database is unreachable, the caller falls
 * back to the live feed, which still covers the current week.
 */

import { prisma } from "@/lib/db";
import {
  fetchEconCalendar,
  groupByDay,
  type CalendarDay,
  type EconCalendar,
  type EconEvent,
  type Impact,
} from "@/lib/econ-calendar";

/** How much history the timeline renders above "today". */
export const HISTORY_DAYS = 30;

export interface SyncResult {
  fetched: number;
  written: number;
}

function toImpact(raw: string): Impact {
  return raw === "high" || raw === "medium" || raw === "low" || raw === "holiday"
    ? raw
    : "low";
}

/**
 * Fetch the current week and upsert it. Consensus figures get revised as a
 * release approaches, so an existing row is updated rather than skipped.
 */
export async function syncEconCalendar(): Promise<SyncResult> {
  const calendar = await fetchEconCalendar();
  const events = calendar.days.flatMap((d) => d.events);
  if (events.length === 0) return { fetched: 0, written: 0 };

  let written = 0;
  for (const ev of events) {
    const data = {
      impact: ev.impact,
      consensus: ev.consensus,
      previous: ev.previous,
      actual: ev.actual,
    };
    await prisma.economicEvent.upsert({
      where: {
        at_currency_event: {
          at: new Date(ev.at),
          currency: ev.currency,
          event: ev.event,
        },
      },
      create: {
        at: new Date(ev.at),
        currency: ev.currency,
        event: ev.event,
        ...data,
      },
      update: data,
    });
    written += 1;
  }

  return { fetched: events.length, written };
}

/**
 * The archive from `HISTORY_DAYS` ago onwards, plus everything scheduled ahead.
 * Merged with the live feed so the current week is present even before the
 * first sync has run.
 */
export async function loadCalendarTimeline(
  historyDays = HISTORY_DAYS,
  now = new Date()
): Promise<EconCalendar> {
  const live = await fetchEconCalendar();

  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - historyDays);

  let stored: EconEvent[] = [];
  try {
    const rows = await prisma.economicEvent.findMany({
      where: { at: { gte: since } },
      orderBy: { at: "asc" },
    });
    stored = rows.map((r) => ({
      at: r.at.toISOString(),
      currency: r.currency,
      event: r.event,
      impact: toImpact(r.impact),
      actual: r.actual,
      consensus: r.consensus,
      previous: r.previous,
    }));
  } catch {
    // Archive unavailable — the live week alone is still worth rendering.
    return live;
  }

  const liveEvents = live.days.flatMap((d) => d.events);
  if (stored.length === 0 && liveEvents.length === 0) return live;

  return {
    days: mergeDays(stored, liveEvents),
    fetchedAt: live.fetchedAt,
    stale: live.stale,
  };
}

/** Union of archived and live events, live winning on the same event key. */
function mergeDays(stored: EconEvent[], live: EconEvent[]): CalendarDay[] {
  const byKey = new Map<string, EconEvent>();
  for (const ev of [...stored, ...live]) {
    byKey.set(`${ev.at}|${ev.currency}|${ev.event}`, ev);
  }
  return groupByDay(Array.from(byKey.values()));
}

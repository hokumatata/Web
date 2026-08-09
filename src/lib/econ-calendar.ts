/**
 * Real economic-calendar data.
 *
 * This replaces a set of hardcoded weekday templates that shipped invented
 * prints (e.g. "Non-Farm Payrolls actual 206K"). Publishing made-up macro
 * numbers on a financial site is a credibility problem, so every figure here
 * now comes from the upstream feed or is rendered as "—".
 *
 * Source: ForexFactory's public weekly calendar feed (hosted by faireconomy).
 * It is published for exactly this use, needs no API key, and carries the
 * scheduled release time, the currency affected, an expected-volatility rating,
 * the consensus forecast and the previous reading.
 *
 * Known limitation: the feed does not carry the *actual* print, for any event,
 * released or not. `actual` is therefore always null and the column renders
 * "—". It is never inferred or filled in.
 *
 * Coverage is one calendar week (Sunday-Saturday), which is what the upstream
 * feed exposes; there is no next-week endpoint.
 */

/**
 * The schedule for a week barely changes once published, and the feed returns
 * 429 when polled hard, so refresh hourly rather than every few minutes.
 */
export const REVALIDATE_SECONDS = 3600;

export type Impact = "high" | "medium" | "low" | "holiday";

export interface EconEvent {
  /** Release time as an ISO string; render in a single explicit timezone. */
  at: string;
  /** ISO-4217 code of the affected currency, or "ALL" for global events. */
  currency: string;
  event: string;
  impact: Impact;
  /** Always null: the upstream feed does not publish actuals. */
  actual: string | null;
  consensus: string | null;
  previous: string | null;
}

export interface CalendarDay {
  /** UTC calendar date, YYYY-MM-DD. Used as a stable key. */
  date: string;
  events: EconEvent[];
}

export interface EconCalendar {
  days: CalendarDay[];
  /** Null when the upstream feed could not be read. */
  fetchedAt: string | null;
  /** True when serving a previously fetched copy after a failed refresh. */
  stale: boolean;
}

const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

const EMPTY: EconCalendar = { days: [], fetchedAt: null, stale: false };

/**
 * Last successful read, kept per server instance. The upstream feed rate-limits
 * (429) when polled hard, so a failed refresh serves the previous copy rather
 * than blanking the page. A week-old schedule is still accurate; only the
 * consensus figures drift, and those move rarely.
 */
let lastGood: EconCalendar | null = null;

/** Currencies the feed emits, plus the "All" bucket it uses for global events. */
const KNOWN_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "NZD",
  "CAD",
  "CHF",
  "CNY",
  "ALL",
]);

interface RawEvent {
  title?: unknown;
  country?: unknown;
  date?: unknown;
  impact?: unknown;
  forecast?: unknown;
  previous?: unknown;
}

function parseImpact(raw: unknown): Impact | null {
  if (typeof raw !== "string") return null;
  switch (raw.trim().toLowerCase()) {
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    case "holiday":
      return "holiday";
    default:
      return null;
  }
}

/** The feed uses "" for an absent figure; normalize that to null. */
function optionalFigure(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeEvent(raw: RawEvent): EconEvent | null {
  const event = typeof raw.title === "string" ? raw.title.trim() : "";
  const impact = parseImpact(raw.impact);
  if (!event || !impact) return null;

  if (typeof raw.date !== "string") return null;
  const at = new Date(raw.date);
  if (Number.isNaN(at.getTime())) return null;

  const country = typeof raw.country === "string" ? raw.country.trim().toUpperCase() : "";
  const currency = KNOWN_CURRENCIES.has(country) ? country : "ALL";

  return {
    at: at.toISOString(),
    currency,
    event,
    impact,
    actual: null,
    consensus: optionalFigure(raw.forecast),
    previous: optionalFigure(raw.previous),
  };
}

/** Group normalized events into UTC days, each sorted by release time. */
export function groupByDay(events: EconEvent[]): CalendarDay[] {
  const byDate = new Map<string, EconEvent[]>();

  for (const ev of events) {
    const date = ev.at.slice(0, 10);
    const bucket = byDate.get(date);
    if (bucket) bucket.push(ev);
    else byDate.set(date, [ev]);
  }

  return Array.from(byDate.entries())
    .map(([date, evs]) => ({
      date,
      events: evs.sort((a, b) => a.at.localeCompare(b.at)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function parseCalendarFeed(payload: unknown): EconEvent[] {
  if (!Array.isArray(payload)) return [];
  const events: EconEvent[] = [];
  for (const raw of payload) {
    if (typeof raw !== "object" || raw === null) continue;
    const normalized = normalizeEvent(raw as RawEvent);
    if (normalized) events.push(normalized);
  }
  return events;
}

/**
 * Fetch the current week's calendar. Returns an empty calendar rather than
 * throwing, so a feed outage degrades the page to an explicit "unavailable"
 * state instead of showing stale or invented events.
 */
export async function fetchEconCalendar(timeoutMs = 10_000): Promise<EconCalendar> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "TheForexRepublic-Bot/1.0 (+https://theforexrepublic.com)",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    clearTimeout(timer);
    if (!res.ok) return fallback();

    const events = parseCalendarFeed(await res.json());
    if (events.length === 0) return fallback();

    lastGood = {
      days: groupByDay(events),
      fetchedAt: new Date().toISOString(),
      stale: false,
    };
    return lastGood;
  } catch {
    return fallback();
  }
}

function fallback(): EconCalendar {
  return lastGood ? { ...lastGood, stale: true } : EMPTY;
}

/**
 * High-impact events between now and `hoursAhead` from now, soonest first.
 *
 * This is the hook the newsroom automation needs for forward-looking coverage:
 * a release with a published consensus and previous reading is enough to write
 * a preview from, without waiting for an outlet to publish first.
 */
export function upcomingHighImpact(
  calendar: EconCalendar,
  hoursAhead = 36,
  now = new Date()
): EconEvent[] {
  const cutoff = now.getTime() + hoursAhead * 3_600_000;
  return calendar.days
    .flatMap((d) => d.events)
    .filter((ev) => {
      if (ev.impact !== "high") return false;
      const t = new Date(ev.at).getTime();
      return t >= now.getTime() && t <= cutoff;
    })
    .sort((a, b) => a.at.localeCompare(b.at));
}

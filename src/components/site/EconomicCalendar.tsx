"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock, AlertTriangle, Globe, Info, ArrowDown } from "lucide-react";
import type { CalendarDay, EconCalendar, EconEvent, Impact } from "@/lib/econ-calendar";

const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
};

/** All times are rendered in UTC so the page is unambiguous and timezone-stable. */
function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(iso: string): string {
  return new Date(iso).toISOString().slice(11, 16);
}

function formatDayHeading(dateKey: string): { weekday: string; dateLabel: string } {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
    dateLabel: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

/** Parse a metric like "3.5%", "185K", "-0.8%", "4.20M" into a number. */
function toNumber(v?: string | null): number | null {
  if (v == null) return null;
  const m = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

/** Colour the Actual cell green when it beats consensus, red when it misses. */
function actualTone(actual?: string | null, consensus?: string | null): string {
  const a = toNumber(actual);
  const c = toNumber(consensus);
  if (a == null) return "text-ink-400";
  if (c == null) return "text-ink-100";
  if (a > c) return "text-up";
  if (a < c) return "text-down";
  return "text-ink-100";
}

function VolatilityBars({ impact }: { impact: Impact }) {
  if (impact === "holiday") {
    return (
      <span
        className="text-3xs font-bold uppercase tracking-wider text-ink-500"
        title="Market holiday"
      >
        Hol
      </span>
    );
  }
  const filled = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
  const color =
    impact === "high" ? "bg-down" : impact === "medium" ? "bg-accent" : "bg-ink-500";
  const label = impact === "high" ? "High" : impact === "medium" ? "Medium" : "Low";
  return (
    <span
      className="inline-flex items-end gap-0.5 align-middle"
      title={`${label} volatility expected`}
      aria-label={`${label} impact`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-[1px] ${i < filled ? color : "bg-ink-700"}`}
          style={{ height: `${5 + i * 3}px` }}
        />
      ))}
    </span>
  );
}

function EventRow({ ev, past }: { ev: EconEvent; past: boolean }) {
  return (
    <tr
      className={`border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors ${
        past ? "opacity-60" : ""
      }`}
    >
      <td className="px-3 py-2.5">
        <span className="text-xs font-mono text-ink-300 tabular flex items-center gap-1.5">
          <Clock size={10} className="text-ink-500" />
          {formatTime(ev.at)}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className="flex items-center gap-1.5">
          {ev.currency === "ALL" ? (
            <Globe size={12} className="text-ink-500" />
          ) : (
            <span className="text-sm leading-none">{FLAGS[ev.currency] ?? "🏳️"}</span>
          )}
          <span className="text-xs font-semibold text-ink-200">
            {ev.currency === "ALL" ? "Global" : ev.currency}
          </span>
        </span>
      </td>
      <td className="px-2 py-2.5 text-center">
        <VolatilityBars impact={ev.impact} />
      </td>
      <td className="px-3 py-2.5">
        <span className="text-sm font-medium text-ink-100 flex items-center gap-1.5">
          {ev.impact === "high" && (
            <AlertTriangle size={11} className="text-down shrink-0" />
          )}
          {ev.event}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span
          className={`text-sm font-mono tabular font-semibold ${actualTone(
            ev.actual,
            ev.consensus
          )}`}
        >
          {ev.actual ?? "—"}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-sm font-mono text-ink-300 tabular">{ev.consensus ?? "—"}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-sm font-mono text-ink-500 tabular">{ev.previous ?? "—"}</span>
      </td>
    </tr>
  );
}

type DayPosition = "past" | "today" | "future";

function DaySection({ day, position }: { day: CalendarDay; position: DayPosition }) {
  const { weekday, dateLabel } = formatDayHeading(day.date);
  const isToday = position === "today";

  return (
    <section
      id={isToday ? "today" : undefined}
      className={isToday ? "scroll-mt-24" : undefined}
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar
          size={13}
          className={isToday ? "text-accent" : "text-ink-500"}
        />
        <h2
          className={`text-sm font-bold ${isToday ? "text-accent" : "text-ink-50"}`}
        >
          {weekday}
          <span className="text-ink-400 font-medium">, {dateLabel}</span>
        </h2>
        {isToday && (
          <span className="text-3xs font-bold uppercase tracking-wider bg-accent text-white px-1.5 py-0.5 rounded-sm">
            Today
          </span>
        )}
        <span className="text-2xs text-ink-500 ml-1">{day.events.length} events</span>
      </div>

      <div className={`card overflow-hidden ${isToday ? "ring-1 ring-accent/40" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900">
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-20">
                  Time UTC
                </th>
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-20">
                  Cur.
                </th>
                <th className="text-center text-2xs uppercase tracking-wider text-ink-400 px-2 py-2.5 font-semibold w-14">
                  Vol.
                </th>
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold">
                  Event
                </th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-24">
                  Actual
                </th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-24">
                  Consensus
                </th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-24">
                  Previous
                </th>
              </tr>
            </thead>
            <tbody>
              {day.events.map((ev, i) => (
                <EventRow
                  key={`${ev.at}-${ev.event}-${i}`}
                  ev={ev}
                  past={position === "past"}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** Divider marking where the archive ends and the schedule ahead begins. */
function UpcomingDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-ink-700" />
      <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-ink-400">
        <ArrowDown size={11} />
        Coming up
      </span>
      <span className="h-px flex-1 bg-ink-700" />
    </div>
  );
}

export function EconomicCalendar({ calendar }: { calendar: EconCalendar }) {
  const [highOnly, setHighOnly] = useState(false);
  const today = utcDateKey(new Date());
  const scrolled = useRef(false);

  const days = useMemo(() => {
    if (!highOnly) return calendar.days;
    return calendar.days
      .map((d) => ({ ...d, events: d.events.filter((e) => e.impact === "high") }))
      .filter((d) => d.events.length > 0);
  }, [calendar.days, highOnly]);

  const positions = useMemo(
    () =>
      days.map((d): DayPosition =>
        d.date === today ? "today" : d.date < today ? "past" : "future"
      ),
    [days, today]
  );

  // Today is mid-list once history accumulates, so open the page there rather
  // than at the oldest archived day.
  useEffect(() => {
    if (scrolled.current || days.length === 0) return;
    scrolled.current = true;
    const anchor = document.getElementById("today") ?? document.getElementById("upcoming");
    anchor?.scrollIntoView({ block: "start" });
  }, [days.length]);

  const hasToday = positions.includes("today");
  // Where the divider goes when there is no "today" section to anchor on.
  const firstFuture = positions.indexOf("future");
  const pastCount = positions.filter((p) => p === "past").length;
  const futureCount = positions.filter((p) => p === "future").length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <Calendar size={20} className="text-accent" />
        <h1 className="text-2xl font-bold text-ink-50 tracking-tight">Forex Economic Calendar Today</h1>
      </div>
      <p className="text-sm text-ink-400 mb-6">
        Macro releases and central bank decisions on one continuous timeline — recent
        history above, today highlighted, everything scheduled ahead below. All times UTC.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 text-2xs text-ink-500">
          <span>
            {pastCount} past {pastCount === 1 ? "day" : "days"} · {futureCount} upcoming
          </span>
          {hasToday && (
            <a
              href="#today"
              className="font-semibold text-accent hover:underline"
            >
              Jump to today
            </a>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-2xs text-ink-400">
            <span className="flex items-center gap-1">
              <VolatilityBars impact="high" /> High
            </span>
            <span className="flex items-center gap-1">
              <VolatilityBars impact="medium" /> Med
            </span>
            <span className="flex items-center gap-1">
              <VolatilityBars impact="low" /> Low
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-ink-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highOnly}
              onChange={(e) => setHighOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--accent)]"
            />
            High impact only
          </label>
        </div>
      </div>

      {calendar.days.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-400">
          The calendar feed is temporarily unavailable. Please check back shortly.
        </div>
      ) : (
        days.length === 0 && (
          <div className="card p-10 text-center text-sm text-ink-400">
            No high-impact events in this window.
          </div>
        )
      )}

      <div className="space-y-6">
        {days.map((day, i) => (
          <div key={day.date} className="space-y-6">
            {/* Anchor the divider to today when present, else to the first future day. */}
            {((hasToday && positions[i] === "today") ||
              (!hasToday && i === firstFuture && firstFuture > 0)) && (
              <div id="upcoming" className="scroll-mt-24">
                <UpcomingDivider />
              </div>
            )}
            <DaySection day={day} position={positions[i]} />
          </div>
        ))}
      </div>

      {calendar.days.length > 0 && (
        <p className="mt-6 flex items-start gap-2 text-2xs text-ink-500">
          <Info size={12} className="mt-0.5 flex-shrink-0" />
          <span>
            Schedule, consensus forecasts and previous readings via the ForexFactory public
            calendar feed. The feed publishes one week at a time, so history builds up from
            our own archive and deepens over time. Released figures are not carried by the
            feed, so the Actual column shows &ldquo;—&rdquo;. Forecasts are market
            consensus, not our estimates.
            {calendar.stale && " Showing the last successful refresh; the feed is currently unreachable."}
          </span>
        </p>
      )}
    </div>
  );
}

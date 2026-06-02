"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

export type Impact = "high" | "medium" | "low";

export interface EconEvent {
  time: string;
  country: string;
  currency: string;
  flag: string;
  event: string;
  impact: Impact;
  actual?: string | null;
  consensus?: string | null;
  previous?: string | null;
}

export interface CalendarDay {
  weekday: string;
  dateLabel: string;
  /** Offset in days relative to today (0 = today). */
  offset: number;
  events: EconEvent[];
}

type DayFilter = "yesterday" | "today" | "tomorrow" | "week";

const DAY_TABS: { id: DayFilter; label: string }[] = [
  { id: "yesterday", label: "Yesterday" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This Week" },
];

const OFFSET_BY_FILTER: Record<Exclude<DayFilter, "week">, number> = {
  yesterday: -1,
  today: 0,
  tomorrow: 1,
};

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

export function EconomicCalendar({ days }: { days: CalendarDay[] }) {
  const [dayFilter, setDayFilter] = useState<DayFilter>("today");
  const [highOnly, setHighOnly] = useState(false);

  const visibleDays = useMemo(() => {
    const base =
      dayFilter === "week"
        ? days
        : days.filter((d) => d.offset === OFFSET_BY_FILTER[dayFilter]);
    if (!highOnly) return base;
    return base
      .map((d) => ({ ...d, events: d.events.filter((e) => e.impact === "high") }))
      .filter((d) => d.events.length > 0);
  }, [days, dayFilter, highOnly]);

  const totalEvents = visibleDays.reduce((n, d) => n + d.events.length, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <Calendar size={20} className="text-accent" />
        <h1 className="text-2xl font-bold text-ink-50 tracking-tight">Economic Calendar</h1>
      </div>
      <p className="text-sm text-ink-400 mb-6">
        Key macro releases, central bank decisions, and high-impact data — with consensus
        forecasts and live results.
      </p>

      {/* Toolbar: day tabs + impact filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex rounded-md border border-ink-700 bg-ink-900 p-0.5">
          {DAY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setDayFilter(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
                dayFilter === t.id
                  ? "bg-accent text-white"
                  : "text-ink-300 hover:text-ink-100 hover:bg-ink-850"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Volatility legend */}
          <div className="hidden sm:flex items-center gap-3 text-2xs text-ink-400">
            <span className="flex items-center gap-1"><VolatilityBars impact="high" /> High</span>
            <span className="flex items-center gap-1"><VolatilityBars impact="medium" /> Med</span>
            <span className="flex items-center gap-1"><VolatilityBars impact="low" /> Low</span>
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

      {totalEvents === 0 && (
        <div className="card p-10 text-center text-sm text-ink-400">
          No events match the current filter.
        </div>
      )}

      <div className="space-y-6">
        {visibleDays.map((day) => (
          <section key={day.offset}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={13} className="text-accent" />
              <h2 className="text-sm font-bold text-ink-50">
                {day.weekday}
                <span className="text-ink-400 font-medium">, {day.dateLabel}</span>
              </h2>
              {day.offset === 0 && (
                <span className="text-3xs font-bold uppercase tracking-wider bg-accent/15 text-accent px-1.5 py-0.5 rounded-sm">
                  Today
                </span>
              )}
              <span className="text-2xs text-ink-500 ml-1">{day.events.length} events</span>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-ink-700 bg-ink-900">
                      <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-16">Time</th>
                      <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-20">Cur.</th>
                      <th className="text-center text-2xs uppercase tracking-wider text-ink-400 px-2 py-2.5 font-semibold w-14">Vol.</th>
                      <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold">Event</th>
                      <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-24">Actual</th>
                      <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-24">Consensus</th>
                      <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-3 py-2.5 font-semibold w-24">Previous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.events.map((ev, i) => (
                      <tr
                        key={i}
                        className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-mono text-ink-300 tabular flex items-center gap-1.5">
                            <Clock size={10} className="text-ink-500" />
                            {ev.time}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm leading-none">{ev.flag}</span>
                            <span className="text-xs font-semibold text-ink-200">{ev.currency}</span>
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
                          <span className={`text-sm font-mono tabular font-semibold ${actualTone(ev.actual, ev.consensus)}`}>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

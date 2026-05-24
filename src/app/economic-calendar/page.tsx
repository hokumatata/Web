import { Calendar, Clock, AlertTriangle, TrendingUp, Globe } from "lucide-react";

export const metadata = { title: "Economic Calendar" };

interface EconEvent {
  time: string;
  country: string;
  flag: string;
  event: string;
  impact: "high" | "medium" | "low";
  actual?: string;
  forecast?: string;
  previous?: string;
}

function getCalendarEvents(): { date: string; events: EconEvent[] }[] {
  const today = new Date();
  const days: { date: string; events: EconEvent[] }[] = [];

  const templates: EconEvent[][] = [
    [
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Non-Farm Payrolls", impact: "high", forecast: "185K", previous: "175K" },
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Unemployment Rate", impact: "high", forecast: "3.8%", previous: "3.9%" },
      { time: "10:00", country: "US", flag: "🇺🇸", event: "ISM Manufacturing PMI", impact: "high", forecast: "49.5", previous: "49.2" },
      { time: "14:00", country: "US", flag: "🇺🇸", event: "FOMC Meeting Minutes", impact: "high" },
      { time: "04:00", country: "DE", flag: "🇩🇪", event: "German CPI (YoY)", impact: "medium", forecast: "2.4%", previous: "2.2%" },
      { time: "04:30", country: "GB", flag: "🇬🇧", event: "UK GDP (QoQ)", impact: "high", forecast: "0.3%", previous: "0.1%" },
      { time: "19:30", country: "JP", flag: "🇯🇵", event: "BOJ Interest Rate Decision", impact: "high", forecast: "0.25%", previous: "0.25%" },
    ],
    [
      { time: "08:30", country: "US", flag: "🇺🇸", event: "CPI (MoM)", impact: "high", forecast: "0.3%", previous: "0.4%" },
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Core CPI (YoY)", impact: "high", forecast: "3.5%", previous: "3.6%" },
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Initial Jobless Claims", impact: "medium", forecast: "215K", previous: "211K" },
      { time: "10:00", country: "US", flag: "🇺🇸", event: "Consumer Confidence", impact: "medium", forecast: "104.0", previous: "103.7" },
      { time: "05:00", country: "EU", flag: "🇪🇺", event: "ECB Interest Rate Decision", impact: "high", forecast: "4.25%", previous: "4.50%" },
      { time: "09:45", country: "EU", flag: "🇪🇺", event: "Eurozone PMI Composite", impact: "medium", forecast: "51.2", previous: "51.0" },
    ],
    [
      { time: "08:30", country: "US", flag: "🇺🇸", event: "PPI (MoM)", impact: "medium", forecast: "0.2%", previous: "0.3%" },
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Retail Sales (MoM)", impact: "high", forecast: "0.4%", previous: "0.7%" },
      { time: "10:00", country: "US", flag: "🇺🇸", event: "Existing Home Sales", impact: "medium", forecast: "4.20M", previous: "4.19M" },
      { time: "10:00", country: "US", flag: "🇺🇸", event: "Michigan Consumer Sentiment", impact: "medium", forecast: "77.5", previous: "77.2" },
      { time: "02:00", country: "CN", flag: "🇨🇳", event: "China GDP (YoY)", impact: "high", forecast: "5.0%", previous: "5.2%" },
      { time: "04:00", country: "GB", flag: "🇬🇧", event: "UK CPI (YoY)", impact: "high", forecast: "2.1%", previous: "2.3%" },
    ],
    [
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Durable Goods Orders", impact: "medium", forecast: "0.5%", previous: "-0.8%" },
      { time: "10:00", country: "US", flag: "🇺🇸", event: "New Home Sales", impact: "medium", forecast: "680K", previous: "662K" },
      { time: "14:00", country: "US", flag: "🇺🇸", event: "Fed Chair Powell Speech", impact: "high" },
      { time: "08:30", country: "US", flag: "🇺🇸", event: "GDP (QoQ) - Second Estimate", impact: "high", forecast: "2.8%", previous: "3.0%" },
      { time: "03:30", country: "AU", flag: "🇦🇺", event: "RBA Interest Rate Decision", impact: "high", forecast: "4.35%", previous: "4.35%" },
    ],
    [
      { time: "08:30", country: "US", flag: "🇺🇸", event: "PCE Price Index (MoM)", impact: "high", forecast: "0.2%", previous: "0.3%" },
      { time: "08:30", country: "US", flag: "🇺🇸", event: "Core PCE (YoY)", impact: "high", forecast: "2.7%", previous: "2.8%" },
      { time: "10:00", country: "US", flag: "🇺🇸", event: "Pending Home Sales", impact: "medium", forecast: "1.0%", previous: "-2.1%" },
      { time: "09:00", country: "CA", flag: "🇨🇦", event: "BOC Interest Rate Decision", impact: "high", forecast: "4.50%", previous: "4.50%" },
      { time: "04:00", country: "CH", flag: "🇨🇭", event: "SNB Interest Rate Decision", impact: "high", forecast: "1.50%", previous: "1.50%" },
    ],
  ];

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    days.push({
      date: `${dayName}, ${dateStr}`,
      events: templates[i % templates.length]
        .sort((a, b) => a.time.localeCompare(b.time)),
    });
  }

  return days;
}

const impactColors = {
  high: "bg-down/20 text-down border-down",
  medium: "bg-accent/10 text-accent border-accent",
  low: "bg-ink-600/20 text-ink-400 border-ink-500",
};

const impactLabels = {
  high: "High",
  medium: "Med",
  low: "Low",
};

export default function EconomicCalendarPage() {
  const calendar = getCalendarEvents();

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Calendar size={20} className="text-accent" />
        <h1 className="text-2xl font-bold text-ink-50 tracking-tight">Economic Calendar</h1>
      </div>
      <p className="text-sm text-ink-400 mb-8">Key economic events, central bank decisions, and data releases</p>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs text-ink-400 font-medium">Impact:</span>
        {(["high", "medium", "low"] as const).map((level) => (
          <span key={level} className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border ${impactColors[level]}`}>
            {level === "high" && <AlertTriangle size={9} />}
            {impactLabels[level]}
          </span>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="space-y-8">
        {calendar.map((day) => (
          <section key={day.date}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-accent" />
              <h2 className="text-sm font-bold text-ink-50">{day.date}</h2>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-700 bg-ink-900">
                    <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold w-20">Time</th>
                    <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold w-16">Ccy</th>
                    <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Event</th>
                    <th className="text-center text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold w-20">Impact</th>
                    <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold w-20 hidden md:table-cell">Actual</th>
                    <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold w-20 hidden md:table-cell">Forecast</th>
                    <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold w-20 hidden md:table-cell">Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {day.events.map((ev, i) => (
                    <tr key={i} className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-ink-300 tabular flex items-center gap-1.5">
                          <Clock size={11} className="text-ink-500" />
                          {ev.time}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          <span className="mr-1.5">{ev.flag}</span>
                          <span className="text-xs font-semibold text-ink-200">{ev.country}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-ink-100">{ev.event}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border ${impactColors[ev.impact]}`}>
                          {ev.impact === "high" && <AlertTriangle size={8} />}
                          {impactLabels[ev.impact]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm font-mono text-ink-400 tabular">{ev.actual ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm font-mono text-ink-300 tabular">{ev.forecast ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm font-mono text-ink-400 tabular">{ev.previous ?? "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* Info Cards */}
      <section className="mt-12 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card p-5">
            <Globe size={18} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-ink-50 mb-1">Global Coverage</h3>
            <p className="text-xs text-ink-400 leading-relaxed">Economic data from US, Europe, UK, Japan, China, Australia, Canada, and Switzerland.</p>
          </div>
          <div className="card p-5">
            <AlertTriangle size={18} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-ink-50 mb-1">Impact Ratings</h3>
            <p className="text-xs text-ink-400 leading-relaxed">Events rated by market impact. High-impact releases like NFP and CPI move markets significantly.</p>
          </div>
          <div className="card p-5">
            <TrendingUp size={18} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-ink-50 mb-1">Market Movers</h3>
            <p className="text-xs text-ink-400 leading-relaxed">Track central bank decisions, inflation data, employment reports, and GDP releases.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

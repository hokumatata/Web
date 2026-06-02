import { EconomicCalendar, type CalendarDay, type EconEvent } from "@/components/site/EconomicCalendar";

export const metadata = { title: "Economic Calendar" };
export const revalidate = 3600;

// Five weekday templates of high-density macro events (FXStreet-style). Actual
// values are included; they are stripped for future days at render time.
const TEMPLATES: EconEvent[][] = [
  [
    { time: "00:30", country: "AU", currency: "AUD", flag: "🇦🇺", event: "RBA Interest Rate Decision", impact: "high", actual: "4.35%", consensus: "4.35%", previous: "4.35%" },
    { time: "04:00", country: "DE", currency: "EUR", flag: "🇩🇪", event: "German CPI (YoY)", impact: "medium", actual: "2.4%", consensus: "2.3%", previous: "2.2%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Non-Farm Payrolls", impact: "high", actual: "206K", consensus: "185K", previous: "175K" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Unemployment Rate", impact: "high", actual: "4.1%", consensus: "3.9%", previous: "3.9%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Average Hourly Earnings (MoM)", impact: "medium", actual: "0.3%", consensus: "0.3%", previous: "0.4%" },
    { time: "10:00", country: "US", currency: "USD", flag: "🇺🇸", event: "ISM Manufacturing PMI", impact: "high", actual: "49.5", consensus: "49.5", previous: "49.2" },
    { time: "19:50", country: "JP", currency: "JPY", flag: "🇯🇵", event: "BoJ Summary of Opinions", impact: "low", actual: null, consensus: null, previous: null },
  ],
  [
    { time: "02:00", country: "GB", currency: "GBP", flag: "🇬🇧", event: "UK GDP (QoQ)", impact: "high", actual: "0.4%", consensus: "0.3%", previous: "0.1%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "CPI (MoM)", impact: "high", actual: "0.2%", consensus: "0.3%", previous: "0.4%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Core CPI (YoY)", impact: "high", actual: "3.3%", consensus: "3.5%", previous: "3.6%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Initial Jobless Claims", impact: "medium", actual: "220K", consensus: "215K", previous: "211K" },
    { time: "08:15", country: "EU", currency: "EUR", flag: "🇪🇺", event: "ECB Interest Rate Decision", impact: "high", actual: "4.25%", consensus: "4.25%", previous: "4.50%" },
    { time: "08:45", country: "EU", currency: "EUR", flag: "🇪🇺", event: "ECB Press Conference", impact: "high", actual: null, consensus: null, previous: null },
    { time: "10:00", country: "US", currency: "USD", flag: "🇺🇸", event: "CB Consumer Confidence", impact: "medium", actual: "104.7", consensus: "104.0", previous: "103.7" },
  ],
  [
    { time: "02:00", country: "CN", currency: "CNY", flag: "🇨🇳", event: "China GDP (YoY)", impact: "high", actual: "4.7%", consensus: "5.0%", previous: "5.2%" },
    { time: "02:00", country: "GB", currency: "GBP", flag: "🇬🇧", event: "UK CPI (YoY)", impact: "high", actual: "2.0%", consensus: "2.1%", previous: "2.3%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "PPI (MoM)", impact: "medium", actual: "0.1%", consensus: "0.2%", previous: "0.3%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Retail Sales (MoM)", impact: "high", actual: "0.6%", consensus: "0.4%", previous: "0.7%" },
    { time: "10:00", country: "US", currency: "USD", flag: "🇺🇸", event: "Existing Home Sales", impact: "medium", actual: "4.11M", consensus: "4.20M", previous: "4.19M" },
    { time: "10:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Crude Oil Inventories", impact: "low", actual: "-3.4M", consensus: "-1.2M", previous: "0.6M" },
    { time: "14:00", country: "US", currency: "USD", flag: "🇺🇸", event: "FOMC Meeting Minutes", impact: "high", actual: null, consensus: null, previous: null },
  ],
  [
    { time: "03:30", country: "CH", currency: "CHF", flag: "🇨🇭", event: "SNB Interest Rate Decision", impact: "high", actual: "1.25%", consensus: "1.50%", previous: "1.50%" },
    { time: "07:00", country: "GB", currency: "GBP", flag: "🇬🇧", event: "BoE Interest Rate Decision", impact: "high", actual: "5.00%", consensus: "5.00%", previous: "5.25%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "GDP (QoQ) — 2nd Estimate", impact: "high", actual: "2.9%", consensus: "2.8%", previous: "3.0%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Durable Goods Orders (MoM)", impact: "medium", actual: "0.7%", consensus: "0.5%", previous: "-0.8%" },
    { time: "10:00", country: "US", currency: "USD", flag: "🇺🇸", event: "New Home Sales", impact: "medium", actual: "671K", consensus: "680K", previous: "662K" },
    { time: "13:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Fed Chair Powell Speech", impact: "high", actual: null, consensus: null, previous: null },
    { time: "21:45", country: "NZ", currency: "NZD", flag: "🇳🇿", event: "NZ Trade Balance", impact: "low", actual: null, consensus: "0.20B", previous: "0.09B" },
  ],
  [
    { time: "08:30", country: "CA", currency: "CAD", flag: "🇨🇦", event: "BoC Interest Rate Decision", impact: "high", actual: "4.25%", consensus: "4.50%", previous: "4.50%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Core PCE Price Index (MoM)", impact: "high", actual: "0.1%", consensus: "0.2%", previous: "0.3%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Core PCE Price Index (YoY)", impact: "high", actual: "2.6%", consensus: "2.7%", previous: "2.8%" },
    { time: "08:30", country: "US", currency: "USD", flag: "🇺🇸", event: "Personal Spending (MoM)", impact: "medium", actual: "0.4%", consensus: "0.3%", previous: "0.2%" },
    { time: "09:45", country: "US", currency: "USD", flag: "🇺🇸", event: "Chicago PMI", impact: "low", actual: "47.4", consensus: "45.0", previous: "44.0" },
    { time: "10:00", country: "US", currency: "USD", flag: "🇺🇸", event: "UoM Consumer Sentiment", impact: "medium", actual: "78.3", consensus: "77.5", previous: "77.2" },
    { time: "04:00", country: "EU", currency: "EUR", flag: "🇪🇺", event: "Eurozone CPI Flash (YoY)", impact: "high", actual: "2.5%", consensus: "2.5%", previous: "2.6%" },
  ],
];

function buildCalendar(): CalendarDay[] {
  const today = new Date();
  const offsets = [-1, 0, 1, 2, 3];

  return offsets.map((offset, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    let events = TEMPLATES[idx % TEMPLATES.length].map((e) => ({ ...e }));
    // Future days have no released numbers yet.
    if (offset > 0) {
      events = events.map((e) => ({ ...e, actual: null }));
    }
    events.sort((a, b) => a.time.localeCompare(b.time));

    return { weekday, dateLabel, offset, events };
  });
}

export default function EconomicCalendarPage() {
  const days = buildCalendar();

  return (
    <div className="container-tw py-8">
      <EconomicCalendar days={days} />
    </div>
  );
}

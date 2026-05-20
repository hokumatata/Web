import Link from "next/link";
import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

export async function MarketSnapshot() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  return (
    <div className="card">
      <div className="section-title mb-0 border-b-0 px-4 pt-4">
        <h2 className="font-serif text-base font-semibold text-white">Markets</h2>
        <Link href="/markets" className="text-2xs text-accent hover:underline uppercase tracking-wider">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink-700 mt-3">
        <QuoteTable title="Crypto" rows={crypto.slice(0, 6)} digitsForBase={2} />
        <QuoteTable title="Forex" rows={fx.slice(0, 6)} digitsForBase={4} />
      </div>
    </div>
  );
}

function QuoteTable({ title, rows, digitsForBase }: { title: string; rows: MarketQuote[]; digitsForBase: number }) {
  return (
    <div className="bg-ink-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-700">
        <span className="kicker">{title}</span>
        <span className="text-2xs uppercase tracking-wider text-ink-300">24h</span>
      </div>
      <ul>
        {rows.map((q) => {
          const up = q.changePct24h >= 0;
          const digits = q.type === "CRYPTO" && q.price < 1 ? 4 : digitsForBase;
          return (
            <li key={`${q.type}-${q.symbol}`} className="flex items-center justify-between px-4 py-2 border-b border-ink-800 last:border-b-0">
              <div className="flex items-center gap-2 min-w-0">
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="" className="h-5 w-5 rounded-full" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink-100">{q.symbol}</div>
                  <div className="text-2xs text-ink-300 truncate">{q.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 tabular text-sm">
                <span className="text-ink-100">{formatNumber(q.price, digits)}</span>
                <span className={up ? "text-up" : "text-down"}>{formatPercent(q.changePct24h)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

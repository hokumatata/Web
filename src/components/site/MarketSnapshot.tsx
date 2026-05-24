import Link from "next/link";
import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export async function MarketSnapshot() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent" />
          <h2 className="font-serif text-base font-semibold text-white">Market Data</h2>
        </div>
        <Link href="/markets" className="text-2xs text-accent hover:underline uppercase tracking-wider font-medium">
          Full view
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink-700">
        <QuoteTable title="Crypto" rows={crypto.slice(0, 6)} digitsForBase={2} />
        <QuoteTable title="Forex" rows={fx.slice(0, 6)} digitsForBase={4} />
      </div>
    </div>
  );
}

function QuoteTable({ title, rows, digitsForBase }: { title: string; rows: MarketQuote[]; digitsForBase: number }) {
  return (
    <div className="bg-ink-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-700/50">
        <span className="kicker">{title}</span>
        <span className="text-2xs uppercase tracking-wider text-ink-500">24h</span>
      </div>
      <ul>
        {rows.map((q) => {
          const up = q.changePct24h >= 0;
          const digits = q.type === "CRYPTO" && q.price < 1 ? 4 : digitsForBase;
          return (
            <li key={`${q.type}-${q.symbol}`} className="flex items-center justify-between px-4 py-2.5 border-b border-ink-800/50 last:border-b-0 hover:bg-ink-850 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="" className="h-5 w-5 rounded-full" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink-100">{q.symbol}</div>
                  <div className="text-2xs text-ink-400 truncate">{q.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 tabular text-sm font-mono">
                <span className="text-ink-100">{formatNumber(q.price, digits)}</span>
                <span className={`text-xs font-medium ${up ? "text-up" : "text-down"}`}>
                  {formatPercent(q.changePct24h)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

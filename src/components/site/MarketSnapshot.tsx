import Link from "next/link";
import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export async function MarketSnapshot() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700 bg-ink-900">
        <h3 className="text-sm font-bold text-ink-50">Market Data</h3>
        <Link href="/markets" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
          Full View <ArrowRight size={11} />
        </Link>
      </div>
      <div>
        <div className="px-4 py-2 border-b border-ink-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Crypto</span>
        </div>
        {crypto.slice(0, 5).map((q) => (
          <QuoteRow key={`${q.type}-${q.symbol}`} q={q} digits={q.price < 1 ? 4 : 2} />
        ))}
        <div className="px-4 py-2 border-b border-ink-800 border-t">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Forex</span>
        </div>
        {fx.slice(0, 4).map((q) => (
          <QuoteRow key={`${q.type}-${q.symbol}`} q={q} digits={4} />
        ))}
      </div>
    </div>
  );
}

function QuoteRow({ q, digits }: { q: MarketQuote; digits: number }) {
  const up = q.changePct24h >= 0;
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
      <div className="flex items-center gap-2">
        {q.imageUrl && <img src={q.imageUrl} alt="" className="h-4 w-4 rounded-full" />}
        <span className="text-sm font-medium text-ink-100">{q.symbol}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-ink-200 tabular">{formatNumber(q.price, digits)}</span>
        <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold tabular min-w-[60px] justify-end ${up ? "text-up" : "text-down"}`}>
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {up ? "+" : ""}{formatPercent(q.changePct24h)}
        </span>
      </div>
    </div>
  );
}

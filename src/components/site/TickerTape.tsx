import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export async function TickerTape() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  const items = [...crypto.slice(0, 8), ...fx.slice(0, 6)];
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="relative bg-ink-900 border-b border-ink-700">
      <div className="container-tw overflow-hidden scroll-shadow">
        <div className="flex w-max items-center gap-6 py-2 animate-ticker-scroll">
          {loop.map((q, i) => (
            <TickerItem key={`${q.type}-${q.symbol}-${i}`} q={q} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TickerItem({ q }: { q: MarketQuote }) {
  const up = q.changePct24h >= 0;
  const digits = q.type === "CRYPTO" && q.price < 1 ? 4 : q.type === "FX" ? 4 : 2;
  return (
    <div className="flex items-center gap-2 whitespace-nowrap cursor-default group">
      <span className="text-xs font-semibold text-ink-200">{q.symbol}</span>
      <span className="text-xs font-mono text-ink-100 tabular">{formatNumber(q.price, digits)}</span>
      <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold tabular ${up ? "text-up" : "text-down"}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {up ? "+" : ""}{formatPercent(q.changePct24h)}
      </span>
    </div>
  );
}

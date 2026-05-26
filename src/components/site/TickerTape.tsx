import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export async function TickerTape() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  const items = [...crypto.slice(0, 8), ...fx.slice(0, 6)];
  if (items.length === 0) return null;

  return (
    <div className="relative flex w-full overflow-x-hidden bg-ink-900 border-b border-ink-700 group">
      {/* Edge fade overlays */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-ink-900 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-ink-900 to-transparent" />

      {/* Dual-track seamless marquee */}
      <div className="flex w-max group-hover:[animation-play-state:paused]">
        {/* Track 1 */}
        <div className="flex animate-marquee shrink-0 items-center gap-6 pr-6 py-2">
          {items.map((q) => (
            <TickerItem key={`${q.type}-${q.symbol}`} q={q} />
          ))}
        </div>
        {/* Track 2: clone for seamless loop */}
        <div className="flex animate-marquee shrink-0 items-center gap-6 pr-6 py-2" aria-hidden="true">
          {items.map((q) => (
            <TickerItem key={`${q.type}-${q.symbol}-clone`} q={q} />
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
    <div className="flex items-center gap-2 whitespace-nowrap cursor-default">
      <span className="text-xs font-semibold text-ink-200">{q.symbol}</span>
      <span className="text-xs font-mono text-ink-100 tabular">{formatNumber(q.price, digits)}</span>
      <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold tabular ${up ? "text-up" : "text-down"}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {up ? "+" : ""}{formatPercent(q.changePct24h)}
      </span>
    </div>
  );
}

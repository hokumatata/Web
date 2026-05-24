import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

export async function TickerTape() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  const items = [...crypto.slice(0, 8), ...fx.slice(0, 6)];
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="relative border-b border-ink-700 bg-ink-950">
      <div className="container-tw overflow-hidden scroll-shadow">
        <div className="flex w-max items-center gap-5 py-1 animate-ticker-scroll">
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
    <div className="flex items-center gap-1.5 whitespace-nowrap text-3xs tabular cursor-default font-mono">
      <span className="font-bold text-accent">{q.symbol}</span>
      <span className="text-ink-100">{formatNumber(q.price, digits)}</span>
      <span className={`font-bold ${up ? "text-up" : "text-down"}`}>
        {up ? "+" : ""}{formatPercent(q.changePct24h)}
      </span>
      <span className="text-ink-600">|</span>
    </div>
  );
}

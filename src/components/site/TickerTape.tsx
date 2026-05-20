import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

export async function TickerTape() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  const items = [...crypto.slice(0, 8), ...fx.slice(0, 6)];
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="relative border-b border-ink-700 bg-ink-900/70">
      <div className="container-mp overflow-hidden scroll-shadow">
        <div className="flex w-max items-center gap-6 py-2 animate-ticker">
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
    <div className="flex items-center gap-2 whitespace-nowrap text-2xs tabular">
      <span className="font-semibold text-ink-100">{q.symbol}</span>
      <span className="text-ink-100">{formatNumber(q.price, digits)}</span>
      <span className={up ? "text-up" : "text-down"}>{formatPercent(q.changePct24h)}</span>
      <span className="text-ink-700">·</span>
    </div>
  );
}

import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const metadata = { title: "Markets" };
export const revalidate = 30;

export default async function MarketsPage() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp size={24} className="text-accent" />
        <h1 className="font-serif text-3xl font-bold text-white">Markets</h1>
      </div>
      <p className="text-sm text-ink-300 mb-8">Live market data — crypto, forex, and global indices.</p>

      {/* Bloomberg-style summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {crypto.slice(0, 4).map((q) => (
          <MarketSummaryCard key={q.symbol} q={q} />
        ))}
      </div>

      {/* Crypto table */}
      <section className="mb-12">
        <div className="section-title">
          <h2 className="font-serif text-xl">Cryptocurrencies</h2>
          <span className="text-2xs text-ink-400 uppercase tracking-wider">{crypto.length} assets</span>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-850">
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">#</th>
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">Asset</th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">Price</th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {crypto.map((q, i) => (
                <MarketRow key={q.symbol} q={q} index={i + 1} digits={q.price < 1 ? 4 : 2} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Forex table */}
      <section>
        <div className="section-title">
          <h2 className="font-serif text-xl">Foreign Exchange</h2>
          <span className="text-2xs text-ink-400 uppercase tracking-wider">{fx.length} pairs</span>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-850">
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">#</th>
                <th className="text-left text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">Pair</th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">Rate</th>
                <th className="text-right text-2xs uppercase tracking-wider text-ink-400 px-4 py-3 font-medium">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {fx.map((q, i) => (
                <MarketRow key={q.symbol} q={q} index={i + 1} digits={4} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MarketSummaryCard({ q }: { q: MarketQuote }) {
  const up = q.changePct24h >= 0;
  return (
    <div className="card p-4 hover:border-ink-600 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {q.imageUrl && <img src={q.imageUrl} alt="" className="h-6 w-6 rounded-full" />}
        <div>
          <div className="text-sm font-semibold text-white">{q.symbol}</div>
          <div className="text-2xs text-ink-400">{q.label}</div>
        </div>
      </div>
      <div className="font-mono text-xl font-bold text-white tabular">
        ${formatNumber(q.price, q.price < 1 ? 4 : 2)}
      </div>
      <div className={`flex items-center gap-1 mt-1 text-sm font-mono font-medium ${up ? "text-up" : "text-down"}`}>
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {formatPercent(q.changePct24h)}
      </div>
    </div>
  );
}

function MarketRow({ q, index, digits }: { q: MarketQuote; index: number; digits: number }) {
  const up = q.changePct24h >= 0;
  return (
    <tr className="border-b border-ink-800/50 last:border-b-0 hover:bg-ink-850 transition-colors">
      <td className="px-4 py-3 text-sm text-ink-500 tabular">{index}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          {q.imageUrl && <img src={q.imageUrl} alt="" className="h-6 w-6 rounded-full" />}
          <div>
            <div className="text-sm font-medium text-white">{q.symbol}</div>
            <div className="text-2xs text-ink-400">{q.label}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm text-ink-100 tabular">
        {formatNumber(q.price, digits)}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`inline-flex items-center gap-1 font-mono text-sm font-medium tabular ${up ? "text-up" : "text-down"}`}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {formatPercent(q.changePct24h)}
        </span>
      </td>
    </tr>
  );
}

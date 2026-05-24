import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export const metadata = { title: "Markets" };
export const revalidate = 30;

export default async function MarketsPage() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 size={20} className="text-accent" />
        <h1 className="text-2xl font-bold text-ink-50 tracking-tight">Markets</h1>
      </div>
      <p className="text-sm text-ink-400 mb-8">Live market data — crypto, forex, and global indices</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {crypto.slice(0, 4).map((q) => (
          <MarketSummaryCard key={q.symbol} q={q} />
        ))}
      </div>

      {/* Crypto Table */}
      <section className="mb-10">
        <div className="section-title">
          <h2>Cryptocurrencies</h2>
          <span className="text-xs text-ink-400 font-medium">{crypto.length} assets</span>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900">
                <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">#</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Asset</th>
                <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Price</th>
                <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">24h Change</th>
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

      {/* Forex Table */}
      <section>
        <div className="section-title">
          <h2>Foreign Exchange</h2>
          <span className="text-xs text-ink-400 font-medium">{fx.length} pairs</span>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900">
                <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">#</th>
                <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Pair</th>
                <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Rate</th>
                <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">24h Change</th>
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
    <div className="card p-4 hover:border-accent transition-colors">
      <div className="flex items-center gap-2 mb-3">
        {q.imageUrl && <img src={q.imageUrl} alt="" className="h-5 w-5 rounded-full" />}
        <div>
          <span className="text-sm font-bold text-ink-50">{q.symbol}</span>
          <span className="text-xs text-ink-400 ml-1.5">{q.label}</span>
        </div>
      </div>
      <div className="font-mono text-xl font-bold text-ink-50 tabular">
        ${formatNumber(q.price, q.price < 1 ? 4 : 2)}
      </div>
      <div className={`flex items-center gap-1 text-sm font-mono font-semibold tabular mt-1.5 ${up ? "text-up" : "text-down"}`}>
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {up ? "+" : ""}{formatPercent(q.changePct24h)}
      </div>
    </div>
  );
}

function MarketRow({ q, index, digits }: { q: MarketQuote; index: number; digits: number }) {
  const up = q.changePct24h >= 0;
  return (
    <tr className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
      <td className="px-4 py-3 text-sm text-ink-500 tabular font-mono">{index}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          {q.imageUrl && <img src={q.imageUrl} alt="" className="h-5 w-5 rounded-full" />}
          <div>
            <span className="text-sm font-semibold text-ink-50">{q.symbol}</span>
            <span className="text-xs text-ink-400 ml-2">{q.label}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm text-ink-100 tabular font-semibold">
        {formatNumber(q.price, digits)}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`inline-flex items-center gap-1 font-mono text-sm font-semibold tabular ${up ? "text-up" : "text-down"}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {up ? "+" : ""}{formatPercent(q.changePct24h)}
        </span>
      </td>
    </tr>
  );
}

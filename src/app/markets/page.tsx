import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

export const metadata = { title: "Markets" };
export const revalidate = 30;

export default async function MarketsPage() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);

  return (
    <div className="container-tw py-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <span className="block h-5 w-1 bg-accent" />
        <h1 className="text-sm font-bold text-accent uppercase tracking-widest">MARKETS</h1>
      </div>
      <p className="text-3xs text-ink-400 mb-6 uppercase tracking-wider">LIVE MARKET DATA — CRYPTO, FOREX, AND GLOBAL INDICES</p>

      {/* Terminal-style summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-8 border border-ink-700">
        {crypto.slice(0, 4).map((q) => (
          <MarketSummaryCard key={q.symbol} q={q} />
        ))}
      </div>

      {/* Crypto table */}
      <section className="mb-8">
        <div className="section-title">
          <h2>CRYPTOCURRENCIES</h2>
          <span className="text-3xs text-ink-500 tracking-widest">{crypto.length} ASSETS</span>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-800">
                <th className="text-left text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">#</th>
                <th className="text-left text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">ASSET</th>
                <th className="text-right text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">PRICE</th>
                <th className="text-right text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">24H CHG</th>
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
          <h2>FOREIGN EXCHANGE</h2>
          <span className="text-3xs text-ink-500 tracking-widest">{fx.length} PAIRS</span>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-800">
                <th className="text-left text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">#</th>
                <th className="text-left text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">PAIR</th>
                <th className="text-right text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">RATE</th>
                <th className="text-right text-3xs uppercase tracking-widest text-ink-400 px-3 py-2 font-bold">24H CHG</th>
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
    <div className="p-3 bg-ink-900 hover:bg-ink-850 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-3xs font-bold text-accent tracking-wider">{q.symbol}</span>
        <span className="text-3xs text-ink-500 tracking-wider">{q.label}</span>
      </div>
      <div className="font-mono text-base font-bold text-ink-50 tabular">
        ${formatNumber(q.price, q.price < 1 ? 4 : 2)}
      </div>
      <div className={`text-2xs font-mono font-bold tabular mt-0.5 ${up ? "text-up" : "text-down"}`}>
        {up ? "+" : ""}{formatPercent(q.changePct24h)}
      </div>
    </div>
  );
}

function MarketRow({ q, index, digits }: { q: MarketQuote; index: number; digits: number }) {
  const up = q.changePct24h >= 0;
  return (
    <tr className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
      <td className="px-3 py-2 text-2xs text-ink-500 tabular font-mono">{index}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {q.imageUrl && <img src={q.imageUrl} alt="" className="h-4 w-4" />}
          <div>
            <span className="text-2xs font-bold text-ink-50">{q.symbol}</span>
            <span className="text-3xs text-ink-500 ml-2">{q.label}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-right font-mono text-2xs text-ink-100 tabular font-bold">
        {formatNumber(q.price, digits)}
      </td>
      <td className="px-3 py-2 text-right">
        <span className={`font-mono text-2xs font-bold tabular ${up ? "text-up" : "text-down"}`}>
          {up ? "+" : ""}{formatPercent(q.changePct24h)}
        </span>
      </td>
    </tr>
  );
}

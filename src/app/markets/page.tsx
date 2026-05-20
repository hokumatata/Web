import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

export const revalidate = 60;

export const metadata = { title: "Live Markets" };

export default async function MarketsPage() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);

  return (
    <div className="container-mp py-8">
      <div className="section-title">
        <div>
          <span className="kicker">Live data</span>
          <h1 className="font-serif text-3xl">Markets</h1>
          <p className="mt-1 text-sm text-ink-300">
            Crypto via CoinGecko, FX via exchangerate.host. Quotes refresh server-side every ~60s.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketTable title="Crypto" rows={crypto} digits={2} />
        <MarketTable title="Forex" rows={fx} digits={4} />
      </div>
    </div>
  );
}

function MarketTable({ title, rows, digits }: { title: string; rows: MarketQuote[]; digits: number }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
        <span className="kicker">{title}</span>
        <span className="text-2xs uppercase tracking-wider text-ink-300">{rows.length} symbols</span>
      </div>
      <table className="w-full text-sm tabular">
        <thead className="text-2xs uppercase tracking-wider text-ink-300">
          <tr className="border-b border-ink-700">
            <th className="px-4 py-2 text-left">Symbol</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-right">Price</th>
            <th className="px-4 py-2 text-right">24h %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => {
            const up = q.changePct24h >= 0;
            const d = q.type === "CRYPTO" && q.price < 1 ? 4 : digits;
            return (
              <tr key={`${q.type}-${q.symbol}`} className="border-b border-ink-800 last:border-b-0 hover:bg-ink-800/40">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {q.imageUrl && <img src={q.imageUrl} alt="" className="h-5 w-5 rounded-full" />}
                    <span className="font-semibold text-ink-100">{q.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-ink-200">{q.label}</td>
                <td className="px-4 py-2.5 text-right text-ink-100">{formatNumber(q.price, d)}</td>
                <td className={`px-4 py-2.5 text-right ${up ? "text-up" : "text-down"}`}>
                  {formatPercent(q.changePct24h)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

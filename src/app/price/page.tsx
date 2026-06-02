import { getMarketsTable } from "@/lib/markets";
import { formatCompact } from "@/lib/utils";
import { PriceTable } from "@/components/site/PriceTable";

export const metadata = {
  title: "Crypto Prices",
  description: "Live cryptocurrency prices, market cap, 24h volume, and 7-day trends.",
};
export const revalidate = 60;

export default async function PricePage() {
  const rows = await getMarketsTable(50);
  const totalMarketCap = rows.reduce((sum, r) => sum + r.marketCap, 0);
  const totalVolume = rows.reduce((sum, r) => sum + r.volume24h, 0);
  const btc = rows.find((r) => r.symbol === "BTC");
  const dominance = btc && totalMarketCap ? (btc.marketCap / totalMarketCap) * 100 : null;

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-50">Cryptocurrency Prices</h1>
        <p className="mt-1 text-sm text-ink-400">
          Live prices, market capitalisation, and 24-hour trading volume for the top digital assets.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Top 50 Market Cap" value={`$${formatCompact(totalMarketCap)}`} />
        <Stat label="24h Volume" value={`$${formatCompact(totalVolume)}`} />
        <Stat label="BTC Dominance" value={dominance != null ? `${dominance.toFixed(1)}%` : "—"} />
        <Stat label="Assets Tracked" value={String(rows.length)} />
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-ink-400">
          Market data is temporarily unavailable. Please try again shortly.
        </div>
      ) : (
        <PriceTable initialData={rows} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-ink-50 tabular">{value}</div>
    </div>
  );
}

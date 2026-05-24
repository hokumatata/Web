import Link from "next/link";
import { getCryptoQuotes, getFxQuotes, type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

export async function MarketSnapshot() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-ink-700 bg-ink-800">
        <span className="text-3xs font-bold text-accent uppercase tracking-widest">MARKET DATA</span>
        <Link href="/markets" className="text-3xs text-ink-400 hover:text-accent uppercase tracking-widest font-semibold">
          FULL VIEW &gt;
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink-700">
        <QuoteTable title="CRYPTO" rows={crypto.slice(0, 6)} digitsForBase={2} />
        <QuoteTable title="FOREX" rows={fx.slice(0, 6)} digitsForBase={4} />
      </div>
    </div>
  );
}

function QuoteTable({ title, rows, digitsForBase }: { title: string; rows: MarketQuote[]; digitsForBase: number }) {
  return (
    <div className="bg-ink-900">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-ink-700">
        <span className="text-3xs font-bold text-accent tracking-widest">{title}</span>
        <span className="text-3xs text-ink-500 tracking-widest">24H CHG</span>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((q) => {
            const up = q.changePct24h >= 0;
            const digits = q.type === "CRYPTO" && q.price < 1 ? 4 : digitsForBase;
            return (
              <tr key={`${q.type}-${q.symbol}`} className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
                <td className="px-3 py-1.5">
                  <span className="text-2xs font-bold text-ink-100">{q.symbol}</span>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <span className="text-2xs font-mono text-ink-100 tabular">{formatNumber(q.price, digits)}</span>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <span className={`text-2xs font-mono font-bold tabular ${up ? "text-up" : "text-down"}`}>
                    {up ? "+" : ""}{formatPercent(q.changePct24h)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

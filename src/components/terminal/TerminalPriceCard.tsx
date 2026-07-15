"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TerminalChart } from "@/components/charts/TerminalChart";
import type { MarketQuote } from "@/lib/markets";

interface OHLCBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

async function fetchOHLC(symbol: string): Promise<OHLCBar[]> {
  const res = await fetch(`/api/ohlc?symbol=${symbol}`);
  if (!res.ok) return [];
  return res.json();
}

async function fetchTicker(): Promise<MarketQuote[]> {
  const res = await fetch("/api/ticker");
  if (!res.ok) return [];
  return res.json();
}

export function TerminalPriceCard({
  symbol,
  title,
  isFx = false,
}: {
  symbol: string;
  title: string;
  isFx?: boolean;
}) {
  const { data: ohlc } = useQuery({
    queryKey: ["ohlc", symbol],
    queryFn: () => fetchOHLC(symbol),
    staleTime: 5 * 60_000,
  });

  const { data: ticker } = useQuery({
    queryKey: ["ticker"],
    queryFn: fetchTicker,
    refetchInterval: 15_000,
  });

  const TICKER_ALIAS: Record<string, string> = { GOLD: "XAU", SILVER: "XAG", OIL: "WTI" };
  const tickerSym = TICKER_ALIAS[symbol] ?? symbol;
  const quote = ticker?.find((q) => q.symbol === tickerSym);
  const bars = ohlc ?? [];
  const digits = isFx ? 4 : quote && quote.price < 1 ? 4 : 2;

  const high24 = bars.length ? Math.max(...bars.slice(-7).map((b) => b.high)) : null;
  const low24 = bars.length ? Math.min(...bars.slice(-7).map((b) => b.low)) : null;
  const high52 = bars.length ? Math.max(...bars.map((b) => b.high)) : null;
  const low52 = bars.length ? Math.min(...bars.map((b) => b.low)) : null;

  return (
    <div className="space-y-4">
      {/* Price Header */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-ink-50">{title}</h1>
        {quote && (
          <>
            <span className="text-2xl font-mono font-bold text-ink-100 tabular">
              {isFx ? "" : "$"}{formatNumber(quote.price, digits)}
            </span>
            <span className={`flex items-center gap-1 text-lg font-mono font-semibold tabular ${quote.changePct24h >= 0 ? "text-up" : "text-down"}`}>
              {quote.changePct24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {formatPercent(quote.changePct24h)}
            </span>
          </>
        )}
      </div>

      {/* Chart */}
      <TerminalChart data={bars} height={400} />

      {/* Key Levels */}
      {(high24 !== null) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <LevelCard label="7D High" value={high24} digits={digits} isFx={isFx} />
          <LevelCard label="7D Low" value={low24} digits={digits} isFx={isFx} />
          <LevelCard label="90D High" value={high52} digits={digits} isFx={isFx} />
          <LevelCard label="90D Low" value={low52} digits={digits} isFx={isFx} />
        </div>
      )}
    </div>
  );
}

function LevelCard({ label, value, digits, isFx }: { label: string; value: number | null; digits: number; isFx: boolean }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xs text-ink-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-mono font-semibold text-ink-100 tabular">
        {value !== null ? `${isFx ? "" : "$"}${formatNumber(value, digits)}` : "—"}
      </div>
    </div>
  );
}

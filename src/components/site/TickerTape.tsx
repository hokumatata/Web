"use client";

import { useQuery } from "@tanstack/react-query";
import { type MarketQuote } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

async function fetchTicker(): Promise<MarketQuote[]> {
  const res = await fetch("/api/ticker");
  if (!res.ok) throw new Error(`ticker ${res.status}`);
  return res.json();
}

export function TickerTape() {
  const { data: items, isLoading, isError } = useQuery({
    queryKey: ["ticker"],
    queryFn: fetchTicker,
    refetchInterval: 45_000,
    retry: 2,
  });

  if (isLoading) return <TickerSkeleton />;
  if (isError || !items || items.length === 0) return <TickerError />;

  return (
    <div className="relative flex w-full overflow-x-hidden bg-ink-900 border-b border-ink-700 group">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-ink-900 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-ink-900 to-transparent" />

      <div className="flex w-max group-hover:[&>div]:[animation-play-state:paused]">
        <div className="flex animate-marquee shrink-0 items-center gap-6 pr-6 py-2">
          {items.map((q) => (
            <TickerItem key={`${q.type}-${q.symbol}`} q={q} />
          ))}
        </div>
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
        {formatPercent(q.changePct24h)}
      </span>
    </div>
  );
}

function TickerSkeleton() {
  return (
    <div className="bg-ink-900 border-b border-ink-700 py-2">
      <div className="flex items-center gap-6 overflow-hidden px-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div className="h-3 w-10 rounded-sm bg-ink-700 animate-pulse" />
            <div className="h-3 w-16 rounded-sm bg-ink-700 animate-pulse" />
            <div className="h-3 w-12 rounded-sm bg-ink-700 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TickerError() {
  return (
    <div className="bg-ink-900 border-b border-ink-700 py-2">
      <div className="flex items-center justify-center gap-2 px-4">
        <span className="text-2xs text-ink-500">Market data temporarily unavailable</span>
      </div>
    </div>
  );
}

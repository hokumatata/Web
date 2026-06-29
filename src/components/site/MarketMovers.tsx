"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketRow } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

async function fetchPrices(): Promise<MarketRow[]> {
  const res = await fetch("/api/prices");
  if (!res.ok) throw new Error(`prices ${res.status}`);
  return res.json();
}

function Row({ r }: { r: MarketRow }) {
  const up = r.change24h >= 0;
  return (
    <Link href="/price" className="flex items-center gap-2 px-4 py-2 hover:bg-ink-900/60">
      {r.image && <img src={r.image} alt="" className="h-5 w-5 rounded-full" />}
      <span className="text-sm font-semibold text-ink-100">{r.symbol}</span>
      <span className="ml-auto font-mono text-xs tabular text-ink-200">
        ${formatNumber(r.price, r.price < 1 ? 4 : 2)}
      </span>
      <span className={`flex w-16 items-center justify-end gap-0.5 font-mono text-xs font-semibold tabular ${up ? "text-up" : "text-down"}`}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {formatPercent(r.change24h)}
      </span>
    </Link>
  );
}

export function MarketMovers() {
  const { data } = useQuery({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    refetchInterval: 60_000,
    retry: 2,
  });

  const rows = data ?? [];
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => b.change24h - a.change24h);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <div className="card">
      <div className="border-b border-ink-700 bg-ink-900 px-4 py-3">
        <h3 className="text-sm font-bold text-ink-50">Market Movers</h3>
        <span className="text-2xs text-ink-500">Top crypto by 24h move</span>
      </div>
      <div className="py-1">
        <div className="px-4 pb-1 pt-2 text-2xs font-bold uppercase tracking-wide text-up">Gainers</div>
        {gainers.map((r) => (
          <Row key={`g-${r.id}`} r={r} />
        ))}
        <div className="px-4 pb-1 pt-2 text-2xs font-bold uppercase tracking-wide text-down">Losers</div>
        {losers.map((r) => (
          <Row key={`l-${r.id}`} r={r} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { type MarketRow } from "@/lib/markets";
import { formatNumber, formatPercent, formatCompact } from "@/lib/utils";

type SortKey = "rank" | "price" | "change1h" | "change24h" | "change7d" | "volume24h" | "marketCap";

async function fetchPrices(): Promise<MarketRow[]> {
  const res = await fetch("/api/prices");
  if (!res.ok) throw new Error(`prices ${res.status}`);
  return res.json();
}

export function PriceTable({ initialData }: { initialData: MarketRow[] }) {
  const { data, isFetching } = useQuery({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    initialData,
    refetchInterval: 60_000,
    retry: 2,
  });

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((r) => r.name.toLowerCase().includes(q) || r.symbol.toLowerCase().includes(q))
      : data;
    const sorted = [...filtered].sort((a, b) => {
      const dir = asc ? 1 : -1;
      return (a[sortKey] - b[sortKey]) * dir;
    });
    return sorted;
  }, [data, query, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      // Rank sorts ascending by default; everything else descending (biggest first).
      setAsc(key === "rank");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coin or symbol..."
            className="input pl-9 w-full text-sm h-9 bg-ink-900 border-ink-700"
          />
        </div>
        <span className="flex items-center gap-1.5 text-xs text-ink-500 whitespace-nowrap">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? "bg-accent animate-pulse" : "bg-up"}`} />
          {isFetching ? "Updating…" : "Live · 60s"}
        </span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-900 text-left text-xs uppercase tracking-wider text-ink-400">
              <Th label="#" onClick={() => toggleSort("rank")} active={sortKey === "rank"} className="w-12" />
              <th className="px-4 py-3 font-semibold">Coin</th>
              <Th label="Price" onClick={() => toggleSort("price")} active={sortKey === "price"} align="right" />
              <Th label="1h %" onClick={() => toggleSort("change1h")} active={sortKey === "change1h"} align="right" />
              <Th label="24h %" onClick={() => toggleSort("change24h")} active={sortKey === "change24h"} align="right" />
              <Th label="7d %" onClick={() => toggleSort("change7d")} active={sortKey === "change7d"} align="right" />
              <Th label="24h Volume" onClick={() => toggleSort("volume24h")} active={sortKey === "volume24h"} align="right" />
              <Th label="Market Cap" onClick={() => toggleSort("marketCap")} active={sortKey === "marketCap"} align="right" />
              <th className="px-4 py-3 font-semibold text-right">Last 7d</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
                <td className="px-4 py-3 text-ink-500 tabular">{r.rank || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {r.image && <img src={r.image} alt="" className="h-6 w-6 rounded-full" />}
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-ink-50">{r.name}</span>
                      <span className="text-xs text-ink-500">{r.symbol}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-ink-100 tabular">
                  ${formatNumber(r.price, r.price < 1 ? 4 : 2)}
                </td>
                <ChangeCell value={r.change1h} />
                <ChangeCell value={r.change24h} />
                <ChangeCell value={r.change7d} />
                <td className="px-4 py-3 text-right font-mono text-ink-200 tabular">${formatCompact(r.volume24h)}</td>
                <td className="px-4 py-3 text-right font-mono text-ink-200 tabular">${formatCompact(r.marketCap)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Sparkline points={r.sparkline} up={r.change7d >= 0} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-ink-500">
                  No coins match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-ink-500">
        Data from CoinGecko · refreshes every 60s.{" "}
        <Link href="/economic-calendar" className="text-accent hover:underline">View the economic calendar →</Link>
      </p>
    </div>
  );
}

function Th({
  label,
  onClick,
  active,
  align = "left",
  className = "",
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 font-semibold ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-accent transition-colors ${active ? "text-accent" : ""} ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <ArrowUpDown size={11} />
      </button>
    </th>
  );
}

function ChangeCell({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <td className={`px-4 py-3 text-right font-mono font-semibold tabular ${up ? "text-up" : "text-down"}`}>
      <span className="inline-flex items-center gap-0.5 justify-end">
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {formatPercent(value)}
      </span>
    </td>
  );
}

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  if (!points || points.length < 2) return <span className="text-ink-700">—</span>;
  const w = 110;
  const h = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(h - ((p - min) / range) * h).toFixed(2)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={d} fill="none" stroke={up ? "#00d26a" : "#ff5252"} strokeWidth={1.5} />
    </svg>
  );
}

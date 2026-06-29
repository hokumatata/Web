"use client";

import { useQuery } from "@tanstack/react-query";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { MarketQuote } from "@/lib/markets";
import type { HeatmapPayload } from "@/app/api/heatmap/route";
import { useState } from "react";

type Tab = "crypto" | "forex" | "commodities" | "indices";
const TABS: { key: Tab; label: string }[] = [
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "Forex" },
  { key: "commodities", label: "Commodities" },
  { key: "indices", label: "Equity Indices" },
];

async function fetchHeatmap(): Promise<HeatmapPayload> {
  const res = await fetch("/api/heatmap");
  if (!res.ok) throw new Error(`heatmap ${res.status}`);
  return res.json();
}

function cellColor(pct: number): string {
  if (pct >= 5) return "bg-emerald-500/80";
  if (pct >= 2) return "bg-emerald-600/60";
  if (pct >= 0.5) return "bg-emerald-700/50";
  if (pct > -0.5) return "bg-ink-700/50";
  if (pct > -2) return "bg-red-700/50";
  if (pct > -5) return "bg-red-600/60";
  return "bg-red-500/80";
}

function HeatCell({ q }: { q: MarketQuote }) {
  const up = q.changePct24h >= 0;
  const isFxPair = q.type === "FX";
  const digits = q.type === "CRYPTO" && q.price < 1 ? 4 : isFxPair ? 4 : 2;
  return (
    <div className={`${cellColor(q.changePct24h)} rounded-lg p-4 flex flex-col items-center justify-center gap-1 transition-colors`}>
      <span className="text-sm font-bold text-ink-100">{q.label}</span>
      <span className="font-mono text-xs text-ink-200 tabular">
        {q.type === "CRYPTO" ? "$" : ""}{formatNumber(q.price, digits)}
      </span>
      <span className={`font-mono text-sm font-bold tabular ${up ? "text-up" : "text-down"}`}>
        {up ? "+" : ""}{formatPercent(q.changePct24h)}
      </span>
    </div>
  );
}

export default function HeatmapPage() {
  const [tab, setTab] = useState<Tab>("crypto");
  const { data, isLoading } = useQuery({
    queryKey: ["heatmap"],
    queryFn: fetchHeatmap,
    refetchInterval: 45_000,
    retry: 2,
  });

  const items = data?.[tab] ?? [];

  return (
    <div className="container-tw py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink-50 mb-1">Market Heatmap</h1>
      <p className="text-sm text-ink-400 mb-6">Real-time price performance across asset classes</p>

      <div className="flex items-center gap-1 mb-6 border-b border-ink-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
              tab === t.key
                ? "text-accent border-accent"
                : "text-ink-400 border-transparent hover:text-ink-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-ink-800 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-500">No data available</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((q) => (
            <HeatCell key={`${q.type}-${q.symbol}`} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}

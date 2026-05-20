"use client";

import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { MarketQuote } from "@/lib/markets";

interface Item {
  id: string;
  symbol: string;
  type: "CRYPTO" | "FX" | "STOCK" | "COMMODITY";
  quote?: MarketQuote;
}

export function WatchlistManager({
  initial,
  available,
}: {
  initial: Item[];
  available: { CRYPTO: { symbol: string; label: string }[]; FX: { symbol: string; label: string }[] };
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [type, setType] = useState<"CRYPTO" | "FX">("CRYPTO");
  const [symbol, setSymbol] = useState<string>(available.CRYPTO[0]?.symbol ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const options = useMemo(() => available[type], [available, type]);

  async function add() {
    if (!symbol) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/me/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, type }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErr(d.error || "Failed.");
        return;
      }
      const existing = items.find((i) => i.symbol === symbol && i.type === type);
      if (!existing) {
        setItems([...items, { id: `${type}:${symbol}`, symbol, type }]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(it: Item) {
    setBusy(true);
    try {
      await fetch("/api/me/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: it.symbol, type: it.type }),
      });
      setItems(items.filter((x) => !(x.symbol === it.symbol && x.type === it.type)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="section-title">
        <h2>Watchlist</h2>
        <span className="text-2xs uppercase tracking-wider text-ink-300">{items.length} symbols</span>
      </div>

      <div className="card p-4">
        <span className="kicker">Add symbol</span>
        <div className="mt-2 flex flex-col md:flex-row gap-2">
          <select
            value={type}
            onChange={(e) => {
              const v = e.target.value as "CRYPTO" | "FX";
              setType(v);
              setSymbol(available[v][0]?.symbol ?? "");
            }}
            className="input md:w-40"
          >
            <option value="CRYPTO">Crypto</option>
            <option value="FX">Forex</option>
          </select>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input flex-1">
            {options.map((o) => (
              <option key={o.symbol} value={o.symbol}>
                {o.symbol} — {o.label}
              </option>
            ))}
          </select>
          <button onClick={add} disabled={busy} className="btn-primary md:w-32 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
        {err && <p className="mt-2 text-sm text-down">{err}</p>}
      </div>

      <div className="mt-4 card overflow-hidden">
        <table className="w-full text-sm tabular">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">Symbol</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">24h</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-300">
                  No symbols yet. Add some above.
                </td>
              </tr>
            )}
            {items.map((it) => {
              const q = it.quote;
              const up = q ? q.changePct24h >= 0 : false;
              const digits = it.type === "CRYPTO" && q && q.price < 1 ? 4 : it.type === "FX" ? 4 : 2;
              return (
                <tr key={`${it.type}:${it.symbol}`} className="border-b border-ink-800 last:border-b-0">
                  <td className="px-4 py-2.5 font-semibold text-ink-100">{it.symbol}</td>
                  <td className="px-4 py-2.5 text-ink-300">{it.type}</td>
                  <td className="px-4 py-2.5 text-right text-ink-100">
                    {q ? formatNumber(q.price, digits) : "—"}
                  </td>
                  <td className={`px-4 py-2.5 text-right ${up ? "text-up" : "text-down"}`}>
                    {q ? formatPercent(q.changePct24h) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => remove(it)}
                      disabled={busy}
                      className="btn-danger h-7 px-2"
                      aria-label={`Remove ${it.symbol}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface WatchlistItem { id: string; symbol: string; type: string }

export function WatchlistManager({ items }: { items: WatchlistItem[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("CRYPTO");

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    await fetch("/api/me/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: symbol.toUpperCase(), type }),
    });
    setSymbol("");
    router.refresh();
  }

  async function remove(item: WatchlistItem) {
    await fetch("/api/me/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: item.symbol, type: item.type }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol (e.g. BTC)" className="input flex-1" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="input w-32">
          <option value="CRYPTO">Crypto</option>
          <option value="FX">Forex</option>
          <option value="STOCK">Stock</option>
        </select>
        <button type="submit" className="btn-primary h-9 px-4"><Plus size={14} /> Add</button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="card p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-ink-100">{item.symbol}</span>
              <span className="badge">{item.type}</span>
            </div>
            <button onClick={() => remove(item)} className="btn-ghost h-7 px-2 text-down"><Trash2 size={13} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-ink-400 text-center py-8">No watchlist items. Add symbols to track.</p>}
      </div>
    </div>
  );
}

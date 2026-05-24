"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Ticker { id: string; symbol: string; label: string; type: string; order: number }

export function TickersManager({ tickers }: { tickers: Ticker[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("CRYPTO");

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!symbol.trim() || !label.trim()) return;
    await fetch("/api/admin/tickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: symbol.toUpperCase(), label, type }),
    });
    setSymbol(""); setLabel("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/tickers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" className="input w-24" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="input flex-1" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="input w-32">
          <option value="CRYPTO">Crypto</option>
          <option value="FX">Forex</option>
          <option value="STOCK">Stock</option>
          <option value="COMMODITY">Commodity</option>
        </select>
        <button type="submit" className="btn-primary h-9 px-4"><Plus size={14} /> Add</button>
      </form>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-850">
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Symbol</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Label</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Type</th>
              <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map((t) => (
              <tr key={t.id} className="border-b border-ink-800/50 hover:bg-ink-850">
                <td className="px-4 py-3 font-mono text-ink-100">{t.symbol}</td>
                <td className="px-4 py-3 text-ink-300">{t.label}</td>
                <td className="px-4 py-3"><span className="badge">{t.type}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(t.id)} className="btn-ghost h-7 px-2 text-down"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

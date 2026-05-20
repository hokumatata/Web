"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface T {
  id: string;
  symbol: string;
  label: string;
  type: string;
  order: number;
}

const TYPES = ["CRYPTO", "FX", "STOCK", "COMMODITY"] as const;

export function TickersManager({ items }: { items: T[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("CRYPTO");
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/tickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, label, type, order }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed.");
      return;
    }
    setSymbol(""); setLabel(""); setOrder(0);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove ticker?")) return;
    await fetch(`/api/admin/tickers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form onSubmit={add} className="card p-4 space-y-2 lg:col-span-1 h-fit">
        <span className="kicker">Add ticker</span>
        <input className="input" placeholder="Symbol (e.g. BTC, EURUSD)" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
        <input className="input" placeholder="Label (e.g. Bitcoin)" value={label} onChange={(e) => setLabel(e.target.value)} required />
        <select className="input" value={type} onChange={(e) => setType(e.target.value as typeof TYPES[number])}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="input" type="number" placeholder="Order" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        {error && <p className="text-sm text-down">{error}</p>}
        <button disabled={busy} className="btn-primary w-full justify-center">
          <Plus size={14} /> Add ticker
        </button>
      </form>

      <div className="card overflow-hidden lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">Symbol</th>
              <th className="px-4 py-2 text-left">Label</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Order</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-300">No tickers.</td></tr>
            )}
            {items.map((t) => (
              <tr key={t.id} className="border-b border-ink-800 last:border-b-0">
                <td className="px-4 py-2.5 text-ink-100 font-semibold">{t.symbol}</td>
                <td className="px-4 py-2.5 text-ink-200">{t.label}</td>
                <td className="px-4 py-2.5"><span className="badge">{t.type}</span></td>
                <td className="px-4 py-2.5 text-right tabular">{t.order}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => remove(t.id)} className="btn-danger h-7 px-2 text-xs">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

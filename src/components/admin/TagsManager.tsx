"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface T {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export function TagsManager({ items }: { items: T[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed.");
      return;
    }
    setName("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this tag? It will be removed from all articles.")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form onSubmit={add} className="card p-4 space-y-2 lg:col-span-1 h-fit">
        <span className="kicker">New tag</span>
        <input className="input" placeholder="Tag name" value={name} onChange={(e) => setName(e.target.value)} required />
        {error && <p className="text-sm text-down">{error}</p>}
        <button disabled={busy} className="btn-primary w-full justify-center">
          <Plus size={14} /> Add tag
        </button>
      </form>

      <div className="lg:col-span-2 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-right">Articles</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-300">No tags.</td></tr>
            )}
            {items.map((t) => (
              <tr key={t.id} className="border-b border-ink-800 last:border-b-0">
                <td className="px-4 py-2.5 text-ink-100">{t.name}</td>
                <td className="px-4 py-2.5 text-ink-300">#{t.slug}</td>
                <td className="px-4 py-2.5 text-right tabular">{t.articleCount}</td>
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

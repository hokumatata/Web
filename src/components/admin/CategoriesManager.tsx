"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Cat {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  articleCount: number;
}

export function CategoriesManager({ items }: { items: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, description, order }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed.");
      return;
    }
    setName(""); setSlug(""); setDescription(""); setOrder(0);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? (Only allowed if it has 0 articles.)")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form onSubmit={create} className="card p-4 space-y-2 lg:col-span-1">
        <span className="kicker">New category</span>
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" placeholder="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <textarea className="input" placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="input" type="number" placeholder="Order" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        {error && <p className="text-sm text-down">{error}</p>}
        <button disabled={busy} className="btn-primary w-full justify-center">
          <Plus size={14} /> Add category
        </button>
      </form>

      <div className="lg:col-span-2 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-right">Order</th>
              <th className="px-4 py-2 text-right">Articles</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-ink-800 last:border-b-0">
                <td className="px-4 py-2.5 text-ink-100">{c.name}</td>
                <td className="px-4 py-2.5 text-ink-300">/{c.slug}</td>
                <td className="px-4 py-2.5 text-right tabular">{c.order}</td>
                <td className="px-4 py-2.5 text-right tabular">{c.articleCount}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => remove(c.id)}
                    disabled={c.articleCount > 0}
                    title={c.articleCount > 0 ? "Reassign articles first" : "Delete"}
                    className="btn-danger h-7 px-2 text-xs"
                  >
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

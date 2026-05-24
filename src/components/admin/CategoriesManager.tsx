"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Cat { id: string; slug: string; name: string; description: string | null; order: number; _count: { articles: number } }

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc || null }),
    });
    setName(""); setDesc("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input flex-1" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="input flex-1" />
        <button type="submit" className="btn-primary h-9 px-4"><Plus size={14} /> Add</button>
      </form>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-850">
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Slug</th>
              <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Articles</th>
              <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-ink-800/50 hover:bg-ink-850">
                <td className="px-4 py-3 text-ink-100">{c.name}</td>
                <td className="px-4 py-3 text-ink-400 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-right text-ink-300 tabular">{c._count.articles}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(c.id)} className="btn-ghost h-7 px-2 text-down" disabled={c._count.articles > 0}>
                    <Trash2 size={13} />
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

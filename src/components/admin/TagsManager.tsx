"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface TagData { id: string; slug: string; name: string }

export function TagsManager({ tags }: { tags: TagData[] }) {
  const router = useRouter();
  const [name, setName] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" className="input flex-1" />
        <button type="submit" className="btn-primary h-9 px-4"><Plus size={14} /> Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <div key={t.id} className="badge flex items-center gap-2">
            {t.name}
            <button onClick={() => remove(t.id)} className="text-down hover:text-red-400"><Trash2 size={11} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

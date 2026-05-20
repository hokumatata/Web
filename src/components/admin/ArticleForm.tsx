"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface Initial {
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  categoryId: string;
  status: Status;
  isFeatured: boolean;
  isBreaking: boolean;
  tagIds: string[];
}

const DEFAULT_INITIAL: Initial = {
  title: "",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  categoryId: "",
  status: "DRAFT",
  isFeatured: false,
  isBreaking: false,
  tagIds: [],
};

export function ArticleForm({
  mode,
  articleId,
  initial = DEFAULT_INITIAL,
  categories,
  tags,
}: {
  mode: "create" | "edit";
  articleId?: string;
  initial?: Initial;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>({
    ...initial,
    categoryId: initial.categoryId || categories[0]?.id || "",
  });
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Initial>(k: K, v: Initial[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function toggleTag(id: string) {
    setForm((p) => ({
      ...p,
      tagIds: p.tagIds.includes(id) ? p.tagIds.filter((x) => x !== id) : [...p.tagIds, id],
    }));
  }

  async function submit(targetStatus?: Status) {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        coverImageUrl: form.coverImageUrl || null,
        status: targetStatus ?? form.status,
      };
      const res = await fetch(
        mode === "create" ? "/api/articles" : `/api/articles/${articleId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 space-y-4">
        <div className="card p-4">
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="input text-lg font-serif"
            placeholder="Article headline"
          />
          <label className="label mt-3" htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            className="input"
            placeholder="One or two sentences for the dek / SEO description."
          />
          <label className="label mt-3" htmlFor="cover">Cover image URL</label>
          <input
            id="cover"
            value={form.coverImageUrl}
            onChange={(e) => set("coverImageUrl", e.target.value)}
            className="input"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="card">
          <div className="flex items-center border-b border-ink-700">
            <button
              onClick={() => setTab("write")}
              className={`px-4 py-2 text-xs uppercase tracking-wider ${
                tab === "write" ? "text-accent border-b-2 border-accent" : "text-ink-300"
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`px-4 py-2 text-xs uppercase tracking-wider ${
                tab === "preview" ? "text-accent border-b-2 border-accent" : "text-ink-300"
              }`}
            >
              Preview
            </button>
            <span className="ml-auto px-3 text-2xs text-ink-300">Markdown supported</span>
          </div>
          {tab === "write" ? (
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={22}
              className="w-full bg-ink-900 text-ink-100 px-4 py-3 font-mono text-sm focus:outline-none"
              placeholder="## Section heading&#10;&#10;Body text with **bold**, *italic*, [links](https://example.com), and:&#10;- bullet&#10;- list"
            />
          ) : (
            <div
              className="prose-mp p-5"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.body || "_Nothing to preview yet._") }}
            />
          )}
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-4">
        <div className="card p-4">
          <label className="label" htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => set("status", e.target.value as Status)}
            className="input"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <label className="label mt-3" htmlFor="category">Category</label>
          <select
            id="category"
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="input"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 text-ink-200">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-ink-200">
              <input
                type="checkbox"
                checked={form.isBreaking}
                onChange={(e) => set("isBreaking", e.target.checked)}
              />
              Breaking
            </label>
          </div>
        </div>

        <div className="card p-4">
          <span className="label">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const on = form.tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={on ? "badge-accent" : "badge hover:bg-ink-700"}
                >
                  {t.name}
                </button>
              );
            })}
            {tags.length === 0 && <span className="text-2xs text-ink-300">No tags yet. Create some in Tags.</span>}
          </div>
        </div>

        <div className="card p-4 space-y-2">
          {error && <p className="text-sm text-down">{error}</p>}
          <button onClick={() => submit("DRAFT")} disabled={busy} className="btn-secondary w-full justify-center">
            Save as draft
          </button>
          <button onClick={() => submit("PUBLISHED")} disabled={busy} className="btn-primary w-full justify-center">
            {form.status === "PUBLISHED" ? "Save & re-publish" : "Publish"}
          </button>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { RichEditor } from "./RichEditor";

interface Category { id: string; name: string; slug?: string }
interface Tag { id: string; name: string }
interface ArticleData {
  id?: string;
  title: string;
  excerpt: string;
  body: string;
  categoryId: string;
  coverImageUrl: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  isBreaking: boolean;
  tags: string[];
}

export function ArticleForm({
  article,
  categories,
  tags,
  redirectTo = "/admin/articles",
}: {
  article?: ArticleData;
  categories: Category[];
  tags: Tag[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? categories[0]?.id ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(article?.thumbnailUrl ?? "");
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [isBreaking, setIsBreaking] = useState(article?.isBreaking ?? false);
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      excerpt,
      bodyText: body,
      categoryId,
      coverImageUrl: coverImageUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      isFeatured,
      isBreaking,
      tags: selectedTags,
    };

    try {
      const url = article?.id ? `/api/articles/${article.id}` : "/api/articles";
      const method = article?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="label">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input" placeholder="Article title" />
      </div>
      <div>
        <label className="label">Excerpt</label>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required className="input min-h-[80px]" placeholder="Brief summary" />
      </div>

      <RichEditor value={body} onChange={setBody} />

      <div>
        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} label="Cover Image (article hero)" />
      </div>

      <div>
        <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} label="Thumbnail (card image)" />
        <p className="text-2xs text-ink-500 mt-1">Shown on listing cards. Falls back to the cover image if left empty.</p>
      </div>

      <div>
        <label className="label">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTags((prev) => prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id])}
              className={selectedTags.includes(t.id) ? "badge-accent cursor-pointer" : "badge cursor-pointer hover:bg-ink-800"}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ink-200 cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-ink-600" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-200 cursor-pointer">
          <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="rounded border-ink-600" />
          Breaking
        </label>
      </div>
      {error && <p className="text-sm text-down">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary h-10 px-6">
        <Save size={16} />
        {loading ? "Saving..." : article?.id ? "Update Article" : "Create Article"}
      </button>
    </form>
  );
}

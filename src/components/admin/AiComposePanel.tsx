"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Sparkles, ArrowLeft, Info } from "lucide-react";
import { ArticleForm } from "./ArticleForm";

interface Category { id: string; name: string; slug: string }
interface Tag { id: string; name: string }

interface Draft {
  title: string;
  excerpt: string;
  body: string;
  categorySlug: string;
  tags: string[];
}

interface PrefilledArticle {
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

const SOURCE_FIELDS: { key: keyof Sources; label: string; placeholder: string }[] = [
  { key: "keyIdeas", label: "Key ideas / angle", placeholder: "The main points, angle, and anything that must be included." },
  { key: "tweets", label: "Tweet / social text", placeholder: "Paste raw tweet or social post text here." },
  { key: "releases", label: "Official releases / statements", placeholder: "Press releases, filings, official statements, transcripts." },
  { key: "chartNotes", label: "Chart notes / description", placeholder: "Describe the chart in words (levels, trend, patterns). Live TradingView links are NOT read — paste a description, or upload a chart image via the cover/media upload." },
  { key: "referenceText", label: "Reference article text", placeholder: "Paste the text of a reference article." },
  { key: "referenceUrls", label: "Reference URLs", placeholder: "One URL per line. Used only as attribution hints — pages are not fetched." },
];

type Sources = {
  keyIdeas: string;
  tweets: string;
  releases: string;
  chartNotes: string;
  referenceText: string;
  referenceUrls: string;
};

const EMPTY: Sources = {
  keyIdeas: "",
  tweets: "",
  releases: "",
  chartNotes: "",
  referenceText: "",
  referenceUrls: "",
};

export function AiComposePanel({
  categories,
  tags,
  redirectTo = "/dashboard/articles",
}: {
  categories: Category[];
  tags: Tag[];
  redirectTo?: string;
}) {
  const [sources, setSources] = useState<Sources>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const hasContent = Object.values(sources).some((v) => v.trim().length > 0);

  const prefilled = useMemo<PrefilledArticle | null>(() => {
    if (!draft) return null;
    const matchedCategory =
      categories.find((c) => c.slug === draft.categorySlug) ?? categories[0];
    const suggestedLower = draft.tags.map((t) => t.toLowerCase());
    const matchedTagIds = tags
      .filter((t) => suggestedLower.includes(t.name.toLowerCase()))
      .map((t) => t.id);
    return {
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body,
      categoryId: matchedCategory?.id ?? "",
      coverImageUrl: "",
      thumbnailUrl: "",
      isFeatured: false,
      isBreaking: false,
      tags: matchedTagIds,
    };
  }, [draft, categories, tags]);

  const unmatchedTags = useMemo(() => {
    if (!draft) return [];
    const existing = new Set(tags.map((t) => t.name.toLowerCase()));
    return draft.tags.filter((t) => !existing.has(t.toLowerCase()));
  }, [draft, tags]);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sources),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate draft");
        return;
      }
      setDraft(data as Draft);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (draft && prefilled) {
    return (
      <div className="space-y-5">
        <div className="card p-4 bg-ink-850">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-200">
              <Sparkles size={15} className="text-accent" />
              AI draft generated — review and edit before saving. Source paste stays out of the body; it will be saved as a <strong>DRAFT</strong>.
            </div>
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost h-8 px-3 text-xs">
              <ArrowLeft size={13} /> Back to sources
            </button>
          </div>
          <div className="mt-2 text-2xs text-ink-400">
            Suggested category: <span className="text-ink-200">{draft.categorySlug}</span>
            {draft.tags.length > 0 && (
              <> · Suggested tags: <span className="text-ink-200">{draft.tags.join(", ")}</span></>
            )}
          </div>
          {unmatchedTags.length > 0 && (
            <div className="mt-2 flex items-start gap-1.5 text-2xs text-ink-400">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                These suggested tags don&apos;t exist yet and weren&apos;t pre-selected: {unmatchedTags.join(", ")}. Create them in Tags to use them.
              </span>
            </div>
          )}
        </div>
        <ArticleForm
          article={prefilled}
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          redirectTo={redirectTo}
        />
      </div>
    );
  }

  return (
    <form onSubmit={onGenerate} className="space-y-5">
      <p className="text-sm text-ink-300">
        Paste raw sources below as <strong className="font-medium text-ink-200">generation inputs only</strong> — they are not copied into the article. Desk-note bar: price or fact, weekly move, two pressures, the tension; 3–5 claim-headed findings; a mechanism chain; path + kill. Not a headline restatement plus watchlist.
      </p>
      <p className="text-2xs text-ink-400">
        Covers stay a <strong className="font-medium text-ink-300">manual upload</strong> after the draft. Match the designed theme: navy/teal, gold, charts, bold type. Do not use photoreal cash-stack stock. There is no image generator.
      </p>
      {SOURCE_FIELDS.map((f) => (
        <div key={f.key}>
          <label className="label">{f.label}</label>
          <textarea
            value={sources[f.key]}
            onChange={(e) => setSources((prev) => ({ ...prev, [f.key]: e.target.value }))}
            className="input min-h-[90px]"
            placeholder={f.placeholder}
          />
        </div>
      ))}
      {error && <p className="text-sm text-down">{error}</p>}
      <button type="submit" disabled={loading || !hasContent} className="btn-primary h-10 px-6">
        <Sparkles size={16} />
        {loading ? "Generating…" : "Generate draft"}
      </button>
    </form>
  );
}

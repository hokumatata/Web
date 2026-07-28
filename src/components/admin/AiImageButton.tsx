"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AiImageButtonProps {
  kind: "cover" | "thumbnail";
  title: string;
  excerpt?: string;
  categorySlug?: string;
  onGenerated: (url: string) => void;
}

export function AiImageButton({
  kind,
  title,
  excerpt,
  categorySlug,
  onGenerated,
}: AiImageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const disabled = loading || title.trim().length === 0;

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, categorySlug, kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate image");
        return;
      }
      onGenerated(data.url);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={generate}
        disabled={disabled}
        title={title.trim() ? "" : "Enter a title first"}
        className="btn-secondary h-8 px-3 text-xs disabled:opacity-50"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {loading ? "Generating…" : `Generate ${kind} with AI`}
      </button>
      {error && <p className="text-2xs text-down mt-1">{error}</p>}
    </div>
  );
}

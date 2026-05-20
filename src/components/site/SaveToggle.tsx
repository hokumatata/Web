"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function SaveToggle({ articleId, initial }: { articleId: string; initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/me/saved", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (res.ok) setSaved(!saved);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={saved ? "btn-primary h-8 px-3" : "btn-secondary h-8 px-3"}
      aria-pressed={saved}
    >
      {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}

"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";

export function SaveToggle({ articleId, saved }: { articleId: string; saved: boolean }) {
  const [isSaved, setIsSaved] = useState(saved);

  async function toggle() {
    const method = isSaved ? "DELETE" : "POST";
    const res = await fetch("/api/me/saved", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });
    if (res.ok) setIsSaved(!isSaved);
  }

  return (
    <button onClick={toggle} className="btn-ghost h-8 px-2" title={isSaved ? "Unsave" : "Save"}>
      {isSaved ? <BookmarkCheck size={16} className="text-accent" /> : <Bookmark size={16} />}
    </button>
  );
}

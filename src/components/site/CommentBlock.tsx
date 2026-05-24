"use client";

import { useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string };
}

export function CommentBlock({ articleId, comments }: { articleId: string; comments: CommentData[] }) {
  const [list, setList] = useState(comments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setList((prev) => [newComment, ...prev]);
        setBody("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="section-title">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-ink-50">Discussion ({list.length})</h2>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-3 mb-6">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts..."
          className="input flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary px-4">
          <Send size={14} />
        </button>
      </form>

      <div className="space-y-0">
        {list.map((c) => (
          <div key={c.id} className="border-b border-ink-800 py-4 last:border-b-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-6 w-6 rounded-full bg-ink-700 flex items-center justify-center text-2xs font-bold text-ink-200">
                {c.user.name[0]}
              </div>
              <span className="text-sm font-medium text-ink-100">{c.user.name}</span>
              <span className="text-2xs text-ink-400">{formatDate(c.createdAt)}</span>
            </div>
            <p className="text-sm text-ink-200 pl-8">{c.body}</p>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-ink-400 py-4">No comments yet. Be the first to share your view.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";

interface CommentVM {
  id: string;
  body: string;
  createdAt: string;
  author: string;
}

export function CommentBlock({
  articleId,
  initialComments,
  isAuthed,
}: {
  articleId: string;
  initialComments: CommentVM[];
  isAuthed: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error || "Failed to post.");
        return;
      }
      setBody("");
      setStatus("ok");
      setMsg("Submitted — awaiting moderation.");
    } catch {
      setStatus("error");
      setMsg("Network error.");
    }
  }

  return (
    <section>
      <h3 className="font-serif text-xl font-semibold text-white">Discussion</h3>
      {isAuthed ? (
        <form onSubmit={onSubmit} className="mt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={4}
            maxLength={1000}
            placeholder="Share your view..."
            className="input min-h-[100px] resize-y"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xs text-ink-300">
              Comments are reviewed before appearing publicly.
            </p>
            <button type="submit" disabled={status === "loading"} className="btn-primary">
              {status === "loading" ? "Posting..." : "Post comment"}
            </button>
          </div>
          {msg && (
            <p className={`mt-2 text-xs ${status === "ok" ? "text-up" : "text-down"}`}>{msg}</p>
          )}
        </form>
      ) : (
        <p className="mt-3 text-sm text-ink-300">
          <Link href="/login" className="text-accent hover:underline">Sign in</Link> to join the discussion.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <li className="text-sm text-ink-300">Be the first to comment.</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{c.author}</span>
                <span className="text-2xs text-ink-300">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-ink-200 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

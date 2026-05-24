"use client";

import { useRouter } from "next/navigation";
import { Check, X, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CommentData {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  user: { name: string };
  article: { title: string; slug: string };
}

export function CommentsModeration({ comments }: { comments: CommentData[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-ink-100">{c.user.name}</span>
                <span className={c.status === "APPROVED" ? "badge-up" : c.status === "PENDING" ? "badge-accent" : "badge-down"}>
                  {c.status}
                </span>
                <span className="text-2xs text-ink-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-ink-200">{c.body}</p>
              <p className="text-2xs text-ink-400 mt-1">on: {c.article.title}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => updateStatus(c.id, "APPROVED")} className="btn-ghost h-7 px-2 text-up" title="Approve"><Check size={13} /></button>
              <button onClick={() => updateStatus(c.id, "REJECTED")} className="btn-ghost h-7 px-2 text-down" title="Reject"><X size={13} /></button>
              <button onClick={() => remove(c.id)} className="btn-ghost h-7 px-2 text-ink-400" title="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
        </div>
      ))}
      {comments.length === 0 && <p className="text-ink-400 text-center py-8">No comments to moderate.</p>}
    </div>
  );
}

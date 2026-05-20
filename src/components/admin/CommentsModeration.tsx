"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";

interface C {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  authorName: string;
  authorEmail: string;
  articleTitle: string;
  articleSlug: string;
}

export function CommentsModeration({ items, initialStatus }: { items: C[]; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  async function setOne(id: string, next: "APPROVED" | "REJECTED" | "SPAM" | "PENDING") {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete comment?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form action="/admin/comments" className="card p-3 mb-4 flex items-end gap-3">
        <div>
          <label className="label" htmlFor="status">Filter by status</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SPAM">Spam</option>
          </select>
        </div>
        <button className="btn-secondary">Apply</button>
      </form>

      <ul className="space-y-3">
        {items.length === 0 && <li className="text-sm text-ink-300">No comments match.</li>}
        {items.map((c) => (
          <li key={c.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">
                <span className="font-semibold text-white">{c.authorName}</span>
                <span className="text-ink-300 ml-2">{c.authorEmail}</span>
                <span className="text-2xs text-ink-300 ml-2">· {timeAgo(c.createdAt)}</span>
              </div>
              <span
                className={
                  c.status === "APPROVED"
                    ? "badge-up"
                    : c.status === "PENDING"
                    ? "badge-accent"
                    : "badge-down"
                }
              >
                {c.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-200 whitespace-pre-wrap">{c.body}</p>
            <p className="mt-2 text-2xs text-ink-300">
              On article{" "}
              <Link href={`/article/${c.articleSlug}`} className="text-accent hover:underline">
                {c.articleTitle}
              </Link>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setOne(c.id, "APPROVED")} className="btn-secondary text-xs h-7 px-2">Approve</button>
              <button onClick={() => setOne(c.id, "REJECTED")} className="btn-secondary text-xs h-7 px-2">Reject</button>
              <button onClick={() => setOne(c.id, "SPAM")} className="btn-secondary text-xs h-7 px-2">Mark spam</button>
              <button onClick={() => setOne(c.id, "PENDING")} className="btn-secondary text-xs h-7 px-2">Reset</button>
              <button onClick={() => remove(c.id)} className="btn-danger text-xs h-7 px-2 ml-auto">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArticleRowActions({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    await fetch(`/api/articles/${id}/publish`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="inline-flex gap-1">
      <Link href={`/article/${slug}`} className="btn-ghost h-7 text-xs px-2">View</Link>
      <Link href={`/admin/articles/${id}/edit`} className="btn-secondary h-7 text-xs px-2">Edit</Link>
      <button onClick={togglePublish} disabled={busy} className="btn-secondary h-7 text-xs px-2">
        {status === "PUBLISHED" ? "Unpublish" : "Publish"}
      </button>
      <button onClick={remove} disabled={busy} className="btn-danger h-7 text-xs px-2">
        Delete
      </button>
    </div>
  );
}

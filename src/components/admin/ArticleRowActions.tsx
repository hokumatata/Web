"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Send, ClipboardCheck } from "lucide-react";

export function ArticleRowActions({
  id,
  status,
  canPublish = false,
  canDelete = false,
  showReviewLink = false,
}: {
  id: string;
  status: string;
  canPublish?: boolean;
  canDelete?: boolean;
  showReviewLink?: boolean;
}) {
  const router = useRouter();

  async function publish() {
    await fetch(`/api/articles/${id}/publish`, { method: "POST" });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      {status === "REVIEW" && showReviewLink && (
        <Link href="/dashboard/review" className="btn-ghost h-7 px-2 text-accent" title="Review & approve">
          <ClipboardCheck size={13} />
        </Link>
      )}
      {status === "DRAFT" && canPublish && (
        <button onClick={publish} className="btn-ghost h-7 px-2 text-up" title="Publish">
          <Send size={13} />
        </button>
      )}
      {canDelete && (
        <button onClick={remove} className="btn-ghost h-7 px-2 text-down" title="Delete">
          <Trash2 size={13} />
        </button>
      )}
    </>
  );
}

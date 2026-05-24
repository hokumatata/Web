"use client";

import { useRouter } from "next/navigation";
import { Trash2, Send } from "lucide-react";

export function ArticleRowActions({ id, status }: { id: string; status: string }) {
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
      {status === "DRAFT" && (
        <button onClick={publish} className="btn-ghost h-7 px-2 text-up" title="Publish">
          <Send size={13} />
        </button>
      )}
      <button onClick={remove} className="btn-ghost h-7 px-2 text-down" title="Delete">
        <Trash2 size={13} />
      </button>
    </>
  );
}

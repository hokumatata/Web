"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, FileText } from "lucide-react";

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "draft" | "reject">(null);

  async function approve() {
    if (!confirm("Approve and publish this article now?")) return;
    setBusy("approve");
    await fetch(`/api/articles/${id}/publish`, { method: "POST" });
    router.refresh();
    setBusy(null);
  }

  async function keepDraft() {
    setBusy("draft");
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DRAFT" }),
    });
    router.refresh();
    setBusy(null);
  }

  async function reject() {
    if (!confirm("Reject and delete this draft? This cannot be undone.")) return;
    setBusy("reject");
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={approve}
        disabled={busy !== null}
        className="btn-primary h-8 text-xs disabled:opacity-50"
        title="Approve & publish"
      >
        <Check size={14} /> Approve & publish
      </button>
      <button
        onClick={keepDraft}
        disabled={busy !== null}
        className="btn-ghost h-8 text-xs disabled:opacity-50"
        title="Move to drafts to edit"
      >
        <FileText size={14} /> Keep as draft
      </button>
      <button
        onClick={reject}
        disabled={busy !== null}
        className="btn-ghost h-8 text-xs text-down disabled:opacity-50"
        title="Reject & delete"
      >
        <Trash2 size={14} /> Reject
      </button>
    </div>
  );
}

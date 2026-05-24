"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Sub { id: string; email: string; createdAt: string; confirmedAt: string | null }

export function NewsletterAdmin({ subscribers }: { subscribers: Sub[] }) {
  const router = useRouter();

  async function remove(id: string) {
    await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-700 bg-ink-850">
            <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Email</th>
            <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Subscribed</th>
            <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id} className="border-b border-ink-800/50 hover:bg-ink-850">
              <td className="px-4 py-3 text-ink-100">{s.email}</td>
              <td className="px-4 py-3 text-ink-400 text-xs">{formatDate(s.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => remove(s.id)} className="btn-ghost h-7 px-2 text-down"><Trash2 size={13} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {subscribers.length === 0 && <p className="text-ink-400 text-center py-8">No subscribers yet.</p>}
    </div>
  );
}

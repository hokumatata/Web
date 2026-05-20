"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Sub {
  id: string;
  email: string;
  createdAt: string;
  confirmed: boolean;
}

export function NewsletterAdmin({ items }: { items: Sub[] }) {
  const router = useRouter();

  async function remove(id: string) {
    if (!confirm("Remove subscriber?")) return;
    await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function exportCsv() {
    const rows = [["email", "createdAt", "confirmed"], ...items.map((i) => [i.email, i.createdAt, i.confirmed ? "yes" : "no"])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={exportCsv} className="btn-secondary">Export CSV</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Subscribed</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-300">No subscribers.</td>
              </tr>
            )}
            {items.map((s) => (
              <tr key={s.id} className="border-b border-ink-800 last:border-b-0">
                <td className="px-4 py-2.5 text-ink-100">{s.email}</td>
                <td className="px-4 py-2.5 text-2xs text-ink-300 tabular">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-2.5">
                  {s.confirmed ? <span className="badge-up">Confirmed</span> : <span className="badge-accent">Unconfirmed</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => remove(s.id)} className="btn-danger h-7 px-2 text-xs">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface U {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = ["READER", "AUTHOR", "EDITOR", "ADMIN"] as const;

export function UsersManager({ items, currentUserId }: { items: U[]; currentUserId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    setBusy(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusy(null);
    router.refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this user? All their content will also be removed.")) return;
    setBusy(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-2xs uppercase tracking-wider text-ink-300">
          <tr className="border-b border-ink-700">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Created</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id} className="border-b border-ink-800 last:border-b-0">
                <td className="px-4 py-2.5 text-ink-100">
                  {u.name} {isSelf && <span className="badge-accent ml-2">you</span>}
                </td>
                <td className="px-4 py-2.5 text-ink-200">{u.email}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="input h-7 text-xs py-0"
                    disabled={busy === u.id || isSelf}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2.5 text-2xs tabular text-ink-300">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => remove(u.id)}
                    disabled={busy === u.id || isSelf}
                    className="btn-danger h-7 px-2 text-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

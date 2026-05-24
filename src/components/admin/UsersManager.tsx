"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserData { id: string; name: string; email: string; role: string; createdAt: string }

export function UsersManager({ users }: { users: UserData[] }) {
  const router = useRouter();

  async function changeRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-700 bg-ink-850">
            <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Name</th>
            <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Email</th>
            <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Role</th>
            <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium hidden md:table-cell">Joined</th>
            <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-ink-800/50 hover:bg-ink-850">
              <td className="px-4 py-3 text-ink-100">{u.name}</td>
              <td className="px-4 py-3 text-ink-300">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="input h-7 py-0 px-2 text-xs w-24"
                >
                  <option value="READER">Reader</option>
                  <option value="AUTHOR">Author</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td className="px-4 py-3 text-ink-400 text-xs hidden md:table-cell">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => remove(u.id)} className="btn-ghost h-7 px-2 text-down"><Trash2 size={13} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

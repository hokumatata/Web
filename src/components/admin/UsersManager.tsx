"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserData { id: string; name: string; email: string; role: string; createdAt: string }

export function UsersManager({ users }: { users: UserData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("READER");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  async function changeRole(id: string, newRole: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setRole("READER");
      setShowForm(false);
      router.refresh();
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-ghost" : "btn-primary"}>
          {showForm ? <><X size={14} /> Cancel</> : <><UserPlus size={14} /> Add User</>}
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h3 className="text-sm font-bold text-ink-50 mb-4">New User</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="label">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                  <option value="READER">Reader</option>
                  <option value="AUTHOR">Author</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            {formError && <p className="text-sm text-down font-medium">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-900">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-400 font-semibold">Name</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-400 font-semibold">Email</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-400 font-semibold">Role</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-400 font-semibold hidden md:table-cell">Joined</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-ink-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
                <td className="px-4 py-3 text-ink-100 font-medium">{u.name}</td>
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
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserData { id: string; name: string; email: string; role: string; createdAt: string }

export function UsersManager({ users }: { users: UserData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  async function remove(id: string) {
    if (!confirm("Delete this reader?")) return;
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
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create reader");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
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
      <p className="text-sm text-ink-400 mb-6">
        Readers sign up / are managed here. Create editors and authors under{" "}
        <Link href="/admin/authors" className="text-accent hover:underline">Authors</Link>.
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400">{users.length} reader{users.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-ghost" : "btn-primary"}>
          {showForm ? <><X size={14} /> Cancel</> : <><UserPlus size={14} /> Add Reader</>}
        </button>
      </div>

      {/* Create Reader Form */}
      {showForm && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h3 className="text-sm font-bold text-ink-50 mb-4">New Reader</h3>
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
            </div>
            {formError && <p className="text-sm text-down font-medium">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Creating..." : "Create Reader"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Readers Table */}
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
                  <span className="badge">Reader</span>
                </td>
                <td className="px-4 py-3 text-ink-400 text-xs hidden md:table-cell">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(u.id)} className="btn-ghost h-7 px-2 text-down"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-400">
                  No readers yet. Click &quot;Add Reader&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

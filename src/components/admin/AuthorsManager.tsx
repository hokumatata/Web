"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, FileText, ExternalLink } from "lucide-react";

interface AuthorData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  articleCount: number;
  profile: {
    slug: string;
    bio: string | null;
    twitter: string | null;
  } | null;
}

export function AuthorsManager({ authors }: { authors: AuthorData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("AUTHOR");
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, bio, twitter }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create author");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setRole("AUTHOR");
      setBio("");
      setTwitter("");
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
        <div>
          <p className="text-sm text-ink-400 mt-1">{authors.length} author{authors.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-ghost" : "btn-primary"}>
          {showForm ? <><X size={14} /> Cancel</> : <><UserPlus size={14} /> Add author or editor</>}
        </button>
      </div>

      {/* Create Author Form */}
      {showForm && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h3 className="text-sm font-bold text-ink-50 mb-4">New Author</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="jane@theforexrepublic.com"
                />
              </div>
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                  <option value="AUTHOR">Author</option>
                  <option value="EDITOR">Editor</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input min-h-[80px]"
                placeholder="Short author bio..."
              />
            </div>
            <div>
              <label className="label">Twitter/X Handle</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="input"
                placeholder="@handle"
              />
            </div>
            {formError && <p className="text-sm text-down font-medium">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Creating..." : "Create Author"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Authors List */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-900">
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Author</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Email</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Role</th>
              <th className="text-right text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Articles</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 px-4 py-3 font-semibold">Profile</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((a) => (
              <tr key={a.id} className="border-b border-ink-800 last:border-b-0 hover:bg-ink-850 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-ink-50">{a.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-ink-300">{a.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${a.role === "ADMIN" ? "badge-accent" : ""}`}>{a.role}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1.5 text-sm font-mono text-ink-200">
                    <FileText size={12} className="text-ink-400" />
                    {a.articleCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {a.profile ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-accent font-medium">
                      <ExternalLink size={11} />
                      /{a.profile.slug}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-500">No profile</span>
                  )}
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-400">
                  No authors yet. Click &quot;Add author or editor&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
      </div>
      <div>
        <label className="label">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Your password" />
      </div>
      {error && <p className="text-sm text-down">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full h-10">
        <LogIn size={16} />
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-sm text-ink-400 text-center">
        No account? <Link href="/register" className="text-accent hover:underline">Create one</Link>
      </p>
    </form>
  );
}

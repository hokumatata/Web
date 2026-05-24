"use client";

import { useState, type FormEvent } from "react";

export function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "ok" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="card">
      <div className="px-3 py-2 border-b border-ink-700 bg-ink-800">
        <span className="text-3xs font-bold text-accent tracking-widest">DAILY BRIEFING</span>
      </div>
      <div className="p-3">
        <p className="text-3xs text-ink-400 uppercase tracking-wider mb-2">MARKETS, CRYPTO &amp; MACRO — EVERY MORNING</p>
        {status === "ok" ? (
          <p className="text-2xs text-up font-bold uppercase tracking-wider">SUBSCRIBED. CHECK YOUR INBOX.</p>
        ) : (
          <form onSubmit={onSubmit} className="flex gap-1">
            <input
              type="email"
              required
              placeholder="YOUR@EMAIL.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input flex-1 text-2xs h-7 placeholder:uppercase placeholder:tracking-wider"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary h-7 px-3 text-3xs whitespace-nowrap"
            >
              GO
            </button>
          </form>
        )}
        {status === "error" && <p className="text-3xs text-down mt-1 uppercase tracking-wider">ERROR. TRY AGAIN.</p>}
      </div>
    </div>
  );
}

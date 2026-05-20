"use client";

import { useState } from "react";

export function NewsletterInline({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error || "Subscription failed.");
        return;
      }
      setStatus("ok");
      setMsg("Subscribed. Check your inbox.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Network error.");
    }
  }

  return (
    <div className={compact ? "" : "card p-5"}>
      {!compact && (
        <>
          <span className="kicker">Daily briefing</span>
          <h3 className="mt-1 font-serif text-xl font-semibold text-white">Markets in your inbox</h3>
          <p className="mt-1 text-sm text-ink-300">
            One concise email each morning. Crypto, FX, stocks, macro.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" disabled={status === "loading"} className="btn-primary">
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {msg && (
        <p className={`mt-2 text-xs ${status === "ok" ? "text-up" : "text-down"}`}>{msg}</p>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";

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
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-accent/10 border border-accent/20">
          <Mail size={14} className="text-accent" />
        </div>
        <div>
          <h3 className="font-serif text-sm font-semibold text-white">Daily Briefing</h3>
          <p className="text-2xs text-ink-400">Markets, crypto &amp; macro — every morning</p>
        </div>
      </div>
      {status === "ok" ? (
        <p className="text-sm text-up font-medium">Subscribed. Check your inbox.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input flex-1 text-sm h-9"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary h-9 px-4 text-xs whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      )}
      {status === "error" && <p className="text-2xs text-down mt-2">Something went wrong. Try again.</p>}
    </div>
  );
}

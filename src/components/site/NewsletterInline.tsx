"use client";

import { useState, type FormEvent } from "react";
import { Mail, ArrowRight } from "lucide-react";

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
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-50">Daily Briefing</h3>
            <p className="text-xs text-ink-400 mt-0.5">Markets &amp; crypto — every morning</p>
          </div>
        </div>
        {status === "ok" ? (
          <p className="text-sm font-semibold text-up">Subscribed! Check your inbox.</p>
        ) : (
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input flex-1 text-sm h-10"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary h-10 px-4 text-sm whitespace-nowrap"
            >
              <ArrowRight size={14} />
            </button>
          </form>
        )}
        {status === "error" && <p className="text-xs text-down mt-2 font-medium">Something went wrong. Try again.</p>}
      </div>
    </div>
  );
}

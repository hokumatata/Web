"use client";

import { useState } from "react";

export function PreferencesForm({
  initial,
  categories,
}: {
  initial: { topics: string[]; emailDigest: boolean; theme: "dark" | "light" };
  categories: { slug: string; name: string }[];
}) {
  const [topics, setTopics] = useState<string[]>(initial.topics);
  const [emailDigest, setEmailDigest] = useState(initial.emailDigest);
  const [theme, setTheme] = useState<"dark" | "light">(initial.theme);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  function toggle(slug: string) {
    setTopics((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, emailDigest, theme }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error || "Failed.");
        return;
      }
      setStatus("ok");
      setMsg("Saved.");
    } catch {
      setStatus("error");
      setMsg("Network error.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-5">
      <div>
        <span className="label">Topics</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = topics.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                className={on ? "badge-accent" : "badge"}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="label">Email digest</span>
        <label className="flex items-center gap-2 text-sm text-ink-200">
          <input
            type="checkbox"
            checked={emailDigest}
            onChange={(e) => setEmailDigest(e.target.checked)}
          />
          Send me a daily morning briefing
        </label>
      </div>

      <div>
        <span className="label">Theme</span>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={t === theme ? "btn-primary" : "btn-secondary"}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-1 text-2xs text-ink-300">Light theme support is informational only in this build.</p>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? "Saving..." : "Save preferences"}
        </button>
        {msg && (
          <span className={`text-xs ${status === "ok" ? "text-up" : "text-down"}`}>{msg}</span>
        )}
      </div>
    </form>
  );
}

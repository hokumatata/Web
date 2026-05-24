"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface Prefs { topicsJson: string; emailDigest: boolean; theme: string }
interface Cat { slug: string; name: string }

export function PreferencesForm({ prefs, categories }: { prefs: Prefs; categories: Cat[] }) {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>(JSON.parse(prefs.topicsJson || "[]"));
  const [emailDigest, setEmailDigest] = useState(prefs.emailDigest);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/me/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicsJson: JSON.stringify(topics), emailDigest }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  function toggleTopic(slug: string) {
    setTopics((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="label mb-3">Topics of Interest</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => toggleTopic(c.slug)}
              className={topics.includes(c.slug) ? "badge-accent cursor-pointer" : "badge cursor-pointer hover:bg-ink-800"}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-ink-200 cursor-pointer">
          <input type="checkbox" checked={emailDigest} onChange={(e) => setEmailDigest(e.target.checked)} />
          Receive daily email digest
        </label>
      </div>
      <button type="submit" disabled={loading} className="btn-primary h-10 px-6">
        <Save size={16} />
        {loading ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
      </button>
    </form>
  );
}

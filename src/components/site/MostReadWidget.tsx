"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import type { HeadlineItem } from "@/app/api/headlines/route";

interface HeadlinesPayload {
  latest: HeadlineItem[];
  breaking: HeadlineItem[];
  mostRead: HeadlineItem[];
}

async function fetchHeadlines(): Promise<HeadlinesPayload> {
  const res = await fetch("/api/headlines");
  if (!res.ok) throw new Error(`headlines ${res.status}`);
  return res.json();
}

export function MostReadWidget() {
  const { data } = useQuery({
    queryKey: ["headlines"],
    queryFn: fetchHeadlines,
    refetchInterval: 120_000,
    retry: 2,
  });

  const items = (data?.mostRead ?? []).slice(0, 5);
  if (items.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-900 px-4 py-3">
        <Flame size={14} className="text-accent" />
        <h3 className="text-sm font-bold text-ink-50">Most Read</h3>
      </div>
      <ol className="divide-y divide-ink-800">
        {items.map((h, i) => (
          <li key={h.slug} className="flex items-start gap-3 px-4 py-2.5">
            <span className="font-mono text-lg font-bold leading-none text-ink-600">{i + 1}</span>
            <Link
              href={`/article/${h.slug}`}
              className="text-sm font-medium leading-snug text-ink-100 hover:text-accent"
            >
              {h.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

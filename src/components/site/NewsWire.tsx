"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatTimeUTC, timeAgo } from "@/lib/utils";
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

export function NewsWire({ initialItems }: { initialItems: HeadlineItem[] }) {
  const { data, dataUpdatedAt } = useQuery({
    queryKey: ["headlines"],
    queryFn: fetchHeadlines,
    refetchInterval: 60_000,
    retry: 2,
    initialData: { latest: initialItems, breaking: [], mostRead: [] },
  });

  // Tick every 20s so relative timestamps stay fresh without a refetch.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  const items = (data?.latest ?? initialItems).slice(0, 24);

  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-ink-700 bg-ink-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-up" />
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-50">The Wire</h2>
          <span className="text-2xs text-ink-500">· Live newsroom feed</span>
        </div>
        <span className="text-2xs text-ink-500">updated {timeAgo(new Date(dataUpdatedAt))}</span>
      </div>

      <ul className="divide-y divide-ink-800">
        {items.map((h) => (
          <li key={h.slug} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-ink-900/60">
            <span className="w-[68px] shrink-0 font-mono text-2xs text-ink-500">
              {formatTimeUTC(h.publishedAt)}
            </span>
            {h.isBreaking && (
              <span className="shrink-0 rounded-sm bg-down px-1.5 py-0.5 text-2xs font-bold uppercase text-white">
                Breaking
              </span>
            )}
            <Link
              href={`/article/${h.slug}`}
              className="flex-1 truncate text-sm font-medium text-ink-100 group-hover:text-accent"
            >
              {h.title}
            </Link>
            <Link
              href={`/category/${h.categorySlug}`}
              className="hidden shrink-0 text-2xs font-bold uppercase tracking-wide text-accent hover:underline sm:block"
            >
              {h.categoryName}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-ink-700 px-4 py-2.5 text-right">
        <Link href="/news" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
          Full feed <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}

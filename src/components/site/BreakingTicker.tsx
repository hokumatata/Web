"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { formatTimeUTC } from "@/lib/utils";
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

export function BreakingTicker() {
  const { data } = useQuery({
    queryKey: ["headlines"],
    queryFn: fetchHeadlines,
    refetchInterval: 60_000,
    retry: 2,
  });

  const items = (data?.breaking.length ? data.breaking : data?.latest ?? []).slice(0, 12);
  if (items.length === 0) return null;

  return (
    <div className="flex w-full items-stretch border-b border-ink-800 bg-ink-950">
      <div className="flex shrink-0 items-center gap-1.5 bg-down px-3 py-1.5 text-white">
        <Zap size={11} className="fill-white" />
        <span className="text-2xs font-bold uppercase tracking-wider">Breaking</span>
      </div>
      <div className="relative flex flex-1 overflow-x-hidden group">
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-ink-950 to-transparent" />
        <div className="flex w-max group-hover:[&>div]:[animation-play-state:paused]">
          <div className="flex animate-marquee-slow shrink-0 items-center py-1.5">
            {items.map((h) => (
              <BreakingItem key={h.slug} h={h} />
            ))}
          </div>
          <div className="flex animate-marquee-slow shrink-0 items-center py-1.5" aria-hidden="true">
            {items.map((h) => (
              <BreakingItem key={`${h.slug}-clone`} h={h} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakingItem({ h }: { h: HeadlineItem }) {
  return (
    <Link
      href={`/article/${h.slug}`}
      className="flex items-center gap-2 whitespace-nowrap px-4 text-xs text-ink-200 hover:text-accent"
    >
      <span className="font-mono text-2xs text-ink-500">{formatTimeUTC(h.publishedAt)}</span>
      <span className="font-medium">{h.title}</span>
      <span className="text-2xs font-bold uppercase tracking-wide text-accent">{h.categoryName}</span>
      <span className="text-ink-700">•</span>
    </Link>
  );
}

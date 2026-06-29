import { prisma } from "@/lib/db";
import { TerminalPriceCard } from "@/components/terminal/TerminalPriceCard";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { timeAgo, readTime } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Forex Terminal",
  description: "Live EUR/USD, GBP/USD, USD/JPY charts, key levels, and related forex news.",
};

const PAIRS = [
  { symbol: "EURUSD", title: "EUR/USD" },
  { symbol: "GBPUSD", title: "GBP/USD" },
  { symbol: "USDJPY", title: "USD/JPY" },
];

export default async function ForexPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: { slug: "forex" } },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: { category: { select: { slug: true, name: true } }, author: { select: { name: true } } },
  });

  return (
    <div className="container-tw py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink-50 mb-6">Forex Terminal</h1>

      <div className="space-y-10">
        {PAIRS.map((p) => (
          <TerminalPriceCard key={p.symbol} symbol={p.symbol} title={p.title} isFx />
        ))}
      </div>

      <section className="mt-10">
        <div className="section-title">
          <h2>Forex News</h2>
          <Link href="/category/forex" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
            More <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((a) => (
            <Link key={a.slug} href={`/article/${a.slug}`} className="card-hover p-4 group">
              <span className="text-sm font-medium text-ink-100 group-hover:text-accent line-clamp-2">{a.title}</span>
              <span className="mt-2 flex items-center gap-2 text-2xs text-ink-500">
                {a.author && <span>{a.author.name}</span>}
                <span className="flex items-center gap-0.5"><Clock size={10} /> {readTime(a.body)} min</span>
                <span>{timeAgo(a.publishedAt)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

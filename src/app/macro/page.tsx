import { prisma } from "@/lib/db";
import { TerminalPriceCard } from "@/components/terminal/TerminalPriceCard";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { timeAgo, readTime } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Macro Terminal",
  description: "Dollar Index (DXY), S&P 500, and Nasdaq charts with related macro news.",
  alternates: { canonical: "/macro" },
};

const INSTRUMENTS = [
  { symbol: "DXY", title: "Dollar Index (DXY)", isFx: true },
  { symbol: "SPX", title: "S&P 500", isFx: false },
  { symbol: "IXIC", title: "Nasdaq Composite", isFx: false },
];

export default async function MacroPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: { slug: "macro" } },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: { category: { select: { slug: true, name: true } }, author: { select: { name: true } } },
  });

  return (
    <div className="container-tw py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink-50 mb-6">Macro Terminal</h1>

      <div className="space-y-10">
        {INSTRUMENTS.map((inst) => (
          <TerminalPriceCard key={inst.symbol} symbol={inst.symbol} title={inst.title} isFx={inst.isFx} />
        ))}
      </div>

      <section className="mt-10">
        <div className="section-title">
          <h2>Macro & Central Bank News</h2>
          <Link href="/category/macro" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
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

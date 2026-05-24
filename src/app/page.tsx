import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroLead, ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { NewsletterInline } from "@/components/site/NewsletterInline";
import { getCryptoQuotes } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export const revalidate = 60;

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: {
    select: { name: true, authorProfile: { select: { slug: true } } },
  },
} as const;

export default async function HomePage() {
  const [latest, featured, byCategory, crypto] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: INCLUDE,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: INCLUDE,
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        articles: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 4,
          include: INCLUDE,
        },
      },
    }),
    getCryptoQuotes(),
  ]);

  const lead = (featured[0] ?? latest[0]) as ArticleCardData | undefined;
  const subLeads = (featured.slice(1, 4).length >= 3 ? featured.slice(1, 4) : latest.slice(1, 4)) as ArticleCardData[];
  const sideList = latest.slice(1, 21) as ArticleCardData[];
  const topCrypto = crypto.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Market Data Strip */}
      <section className="bg-ink-900 border-b border-ink-700">
        <div className="container-tw py-3">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="text-xs font-semibold text-ink-400 whitespace-nowrap flex-shrink-0">Top Movers</span>
            {topCrypto.map((q) => {
              const up = q.changePct24h >= 0;
              return (
                <Link key={q.symbol} href="/economic-calendar" className="flex items-center gap-3 whitespace-nowrap flex-shrink-0 group">
                  <div className="flex items-center gap-2">
                    {q.imageUrl && <img src={q.imageUrl} alt="" className="h-5 w-5 rounded-full" />}
                    <span className="text-sm font-semibold text-ink-100">{q.symbol}</span>
                  </div>
                  <span className="text-sm font-mono text-ink-200 tabular">${formatNumber(q.price, q.price < 1 ? 4 : 2)}</span>
                  <span className={`flex items-center gap-0.5 text-sm font-mono font-semibold tabular ${up ? "text-up" : "text-down"}`}>
                    {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {up ? "+" : ""}{formatPercent(q.changePct24h)}
                  </span>
                </Link>
              );
            })}
            <Link href="/economic-calendar" className="text-xs font-semibold text-accent hover:underline whitespace-nowrap flex-shrink-0 ml-auto flex items-center gap-1">
              Economic Calendar <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Grid — Bloomberg/CoinDesk asymmetric layout */}
      <div className="container-tw py-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lead Story — big hero on left */}
          <div className="lg:col-span-8">
            {lead && <HeroLead a={lead} />}
            {/* Sub-leads below hero */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {subLeads.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </div>

          {/* Right sidebar — Latest column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Latest Headlines — scrollable, up to 20 items */}
            <div className="card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700 bg-ink-900">
                <h3 className="text-sm font-bold text-ink-50">Latest News</h3>
                <Link href="/news" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                  View All <ArrowRight size={11} />
                </Link>
              </div>
              <div className="px-4 max-h-[600px] overflow-y-auto">
                {sideList.map((a) => (
                  <ArticleCard key={a.slug} a={a as ArticleCardData} variant="headline-only" />
                ))}
              </div>
            </div>

            {/* Market Snapshot Widget */}
            <MarketSnapshot />

            {/* Newsletter CTA */}
            <NewsletterInline />
          </aside>
        </section>

        {/* Category Content Ribbons */}
        <section className="mt-14 space-y-14">
          {byCategory
            .filter((c) => c.articles.length > 0)
            .map((c) => (
              <div key={c.id} className="animate-slide-up">
                <div className="section-title">
                  <h2>{c.name}</h2>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    More <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {c.articles.map((a) => (
                    <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* Bottom CTA Cards */}
        <section className="mt-14 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link href="/economic-calendar" className="card-hover p-6 group">
              <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Economic Calendar</div>
              <div className="text-sm text-ink-200 leading-relaxed">Track key economic events, central bank decisions, and data releases.</div>
              <div className="text-sm text-accent mt-3 font-semibold group-hover:underline flex items-center gap-1">
                View Calendar <ArrowRight size={13} />
              </div>
            </Link>
            <Link href="/news" className="card-hover p-6 group">
              <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">News Feed</div>
              <div className="text-sm text-ink-200 leading-relaxed">Breaking news and analysis from our editorial team worldwide.</div>
              <div className="text-sm text-accent mt-3 font-semibold group-hover:underline flex items-center gap-1">
                Read More <ArrowRight size={13} />
              </div>
            </Link>
            <Link href="/newsletter" className="card-hover p-6 group">
              <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Daily Briefing</div>
              <div className="text-sm text-ink-200 leading-relaxed">Market-moving stories delivered to your inbox every morning.</div>
              <div className="text-sm text-accent mt-3 font-semibold group-hover:underline flex items-center gap-1">
                Subscribe <ArrowRight size={13} />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

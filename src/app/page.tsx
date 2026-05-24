import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroLead, ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { NewsletterInline } from "@/components/site/NewsletterInline";
import { getCryptoQuotes } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, ArrowUpRight, Newspaper, BarChart3 } from "lucide-react";

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
      take: 14,
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
          take: 3,
          include: INCLUDE,
        },
      },
    }),
    getCryptoQuotes(),
  ]);

  const lead = (featured[0] ?? latest[0]) as ArticleCardData | undefined;
  const subLeads = (featured.slice(1, 4).length >= 3 ? featured.slice(1, 4) : latest.slice(1, 4)) as ArticleCardData[];
  const sideList = latest.slice(4, 11) as ArticleCardData[];
  const topCrypto = crypto.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Bloomberg-style market data strip */}
      <section className="border-b border-ink-800/50 bg-ink-950">
        <div className="container-tw py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topCrypto.map((q) => {
              const up = q.changePct24h >= 0;
              return (
                <div key={q.symbol} className="flex items-center justify-between p-3 rounded-sm bg-ink-900 border border-ink-800/50">
                  <div className="flex items-center gap-2">
                    {q.imageUrl && <img src={q.imageUrl} alt="" className="h-6 w-6 rounded-full" />}
                    <div>
                      <div className="text-xs font-semibold text-ink-100">{q.symbol}</div>
                      <div className="text-2xs text-ink-400">{q.label}</div>
                    </div>
                  </div>
                  <div className="text-right tabular">
                    <div className="text-sm font-mono font-semibold text-ink-100">${formatNumber(q.price, q.price < 1 ? 4 : 2)}</div>
                    <div className={`text-2xs font-mono font-medium ${up ? "text-up" : "text-down"}`}>
                      {up ? "\u25B2" : "\u25BC"} {formatPercent(q.changePct24h)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container-tw py-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lead story + sub-leads */}
          <div className="lg:col-span-8">
            {lead && <HeroLead a={lead} />}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {subLeads.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Latest headlines - Bloomberg terminal style */}
            <div className="card">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Newspaper size={14} className="text-accent" />
                  <h2 className="font-serif text-base font-semibold text-white">Latest</h2>
                </div>
                <Link href="/news" className="text-2xs uppercase tracking-wider text-accent hover:underline font-medium flex items-center gap-1">
                  All news <ArrowUpRight size={10} />
                </Link>
              </div>
              <div className="px-4 pb-2">
                {sideList.map((a) => (
                  <ArticleCard key={a.slug} a={a as ArticleCardData} variant="headline-only" />
                ))}
              </div>
            </div>

            <MarketSnapshot />
            <NewsletterInline />
          </aside>
        </section>

        {/* Category sections - CoinDesk style */}
        <section className="mt-14 space-y-14">
          {byCategory
            .filter((c) => c.articles.length > 0)
            .map((c) => (
              <div key={c.id} className="animate-slide-up">
                <div className="section-title">
                  <div className="flex items-baseline gap-3">
                    <span className="kicker">{c.name}</span>
                    <h2 className="font-serif text-xl md:text-2xl">{c.description ?? c.name}</h2>
                  </div>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-2xs uppercase tracking-wider text-accent hover:underline font-medium flex items-center gap-1"
                  >
                    More <ArrowUpRight size={10} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {c.articles.map((a) => (
                    <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* Bloomberg-style data cards at bottom */}
        <section className="mt-14 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/markets" className="card-hover p-6 group">
              <TrendingUp size={24} className="text-accent mb-3" />
              <h3 className="font-serif text-lg font-semibold text-white mb-1">Live Markets</h3>
              <p className="text-sm text-ink-300">Real-time crypto, forex, and equity data from global markets.</p>
              <span className="text-2xs text-accent mt-3 flex items-center gap-1 group-hover:underline">
                View markets <ArrowUpRight size={10} />
              </span>
            </Link>
            <Link href="/news" className="card-hover p-6 group">
              <Newspaper size={24} className="text-accent mb-3" />
              <h3 className="font-serif text-lg font-semibold text-white mb-1">News Feed</h3>
              <p className="text-sm text-ink-300">Breaking news and analysis from our editorial team worldwide.</p>
              <span className="text-2xs text-accent mt-3 flex items-center gap-1 group-hover:underline">
                Read more <ArrowUpRight size={10} />
              </span>
            </Link>
            <Link href="/newsletter" className="card-hover p-6 group">
              <BarChart3 size={24} className="text-accent mb-3" />
              <h3 className="font-serif text-lg font-semibold text-white mb-1">Daily Briefing</h3>
              <p className="text-sm text-ink-300">Get market-moving stories delivered to your inbox every morning.</p>
              <span className="text-2xs text-accent mt-3 flex items-center gap-1 group-hover:underline">
                Subscribe <ArrowUpRight size={10} />
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

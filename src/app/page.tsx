import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroLead, ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { NewsletterInline } from "@/components/site/NewsletterInline";
import { getCryptoQuotes } from "@/lib/markets";
import { formatNumber, formatPercent } from "@/lib/utils";

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
  const topCrypto = crypto.slice(0, 6);

  return (
    <div className="animate-fade-in">
      {/* Bloomberg-style market data strip */}
      <section className="border-b border-ink-700 bg-ink-950">
        <div className="container-tw py-2">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px">
            {topCrypto.map((q) => {
              const up = q.changePct24h >= 0;
              return (
                <div key={q.symbol} className="p-2 border border-ink-700 bg-ink-900">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-bold text-accent tracking-wider">{q.symbol}</span>
                    <span className={`text-3xs font-mono font-bold tabular ${up ? "text-up" : "text-down"}`}>
                      {up ? "+" : ""}{formatPercent(q.changePct24h)}
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-ink-50 tabular mt-0.5">
                    ${formatNumber(q.price, q.price < 1 ? 4 : 2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container-tw py-6">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-px">
          {/* Lead story + sub-leads */}
          <div className="lg:col-span-8 lg:pr-4">
            {lead && <HeroLead a={lead} />}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-px">
              {subLeads.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 lg:border-l lg:border-ink-700 lg:pl-4 space-y-4 mt-4 lg:mt-0">
            {/* Latest headlines */}
            <div className="card">
              <div className="flex items-center justify-between px-3 py-2 border-b border-ink-700 bg-ink-800">
                <span className="text-3xs font-bold text-accent tracking-widest">LATEST HEADLINES</span>
                <Link href="/news" className="text-3xs text-ink-400 hover:text-accent tracking-widest font-semibold">
                  ALL &gt;
                </Link>
              </div>
              <div className="px-3 pb-1">
                {sideList.map((a) => (
                  <ArticleCard key={a.slug} a={a as ArticleCardData} variant="headline-only" />
                ))}
              </div>
            </div>

            <MarketSnapshot />
            <NewsletterInline />
          </aside>
        </section>

        {/* Category sections */}
        <section className="mt-10 space-y-10">
          {byCategory
            .filter((c) => c.articles.length > 0)
            .map((c) => (
              <div key={c.id} className="animate-slide-up">
                <div className="section-title">
                  <h2>{c.name}</h2>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-3xs uppercase tracking-widest text-ink-400 hover:text-accent font-bold"
                  >
                    MORE &gt;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
                  {c.articles.map((a) => (
                    <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* Terminal-style bottom cards */}
        <section className="mt-10 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
            <Link href="/markets" className="card-hover p-4 group border border-ink-700">
              <div className="text-3xs font-bold text-accent tracking-widest mb-2">MARKETS</div>
              <div className="text-xs text-ink-200">Real-time crypto, forex, and equity data from global markets.</div>
              <div className="text-3xs text-accent mt-2 font-bold tracking-widest group-hover:underline">
                VIEW MARKETS &gt;
              </div>
            </Link>
            <Link href="/news" className="card-hover p-4 group border border-ink-700">
              <div className="text-3xs font-bold text-accent tracking-widest mb-2">NEWS FEED</div>
              <div className="text-xs text-ink-200">Breaking news and analysis from our editorial team worldwide.</div>
              <div className="text-3xs text-accent mt-2 font-bold tracking-widest group-hover:underline">
                READ MORE &gt;
              </div>
            </Link>
            <Link href="/newsletter" className="card-hover p-4 group border border-ink-700">
              <div className="text-3xs font-bold text-accent tracking-widest mb-2">DAILY BRIEFING</div>
              <div className="text-xs text-ink-200">Get market-moving stories delivered to your inbox every morning.</div>
              <div className="text-3xs text-accent mt-2 font-bold tracking-widest group-hover:underline">
                SUBSCRIBE &gt;
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

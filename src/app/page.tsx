import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { HeroLead, ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { NewsletterInline } from "@/components/site/NewsletterInline";
import { NewsWire } from "@/components/site/NewsWire";
import type { HeadlineItem } from "@/app/api/headlines/route";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: {
    select: { name: true, authorProfile: { select: { slug: true } } },
  },
} as const;

const getLatestArticles = unstable_cache(
  () =>
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: INCLUDE,
    }),
  ["latest-articles"],
  { revalidate: 60, tags: ["articles"] }
);

const getFeaturedArticles = unstable_cache(
  () =>
    prisma.article.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: INCLUDE,
    }),
  ["featured-articles"],
  { revalidate: 60, tags: ["articles"] }
);

const CATEGORY_SECTIONS = [
  { slug: "crypto", name: "Crypto" },
  { slug: "forex", name: "Forex" },
  { slug: "macro", name: "Macro" },
  { slug: "gold", name: "Gold" },
  { slug: "stocks", name: "Stocks" },
  { slug: "opinion", name: "Opinion" },
];

const getCategoryArticles = unstable_cache(
  (slug: string) =>
    prisma.article.findMany({
      where: { status: "PUBLISHED", category: { slug } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: INCLUDE,
    }),
  ["category-articles"],
  { revalidate: 60, tags: ["articles"] }
);

export default async function HomePage() {
  const [latest, featured, ...categoryResults] = await Promise.all([
    getLatestArticles(),
    getFeaturedArticles(),
    ...CATEGORY_SECTIONS.map((c) => getCategoryArticles(c.slug)),
  ]);

  const lead = (featured[0] ?? latest[0]) as ArticleCardData | undefined;
  const subLeads = (featured.slice(1, 4).length >= 3 ? featured.slice(1, 4) : latest.slice(1, 4)) as ArticleCardData[];
  const wireItems: HeadlineItem[] = latest.map((a) => ({
    slug: a.slug,
    title: a.title,
    categorySlug: a.category.slug,
    categoryName: a.category.name,
    publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : null,
    isBreaking: a.isBreaking,
    views: a.views,
  }));

  return (
    <div className="animate-fade-in">
      {/* Hero Grid */}
      <div className="container-tw py-8">
        <section>
          {lead && <HeroLead a={lead} />}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {subLeads.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </section>

        {/* Category Sections */}
        {CATEGORY_SECTIONS.map((cat, idx) => {
          const articles = (categoryResults[idx] ?? []) as ArticleCardData[];
          if (articles.length === 0) return null;
          return (
            <section key={cat.slug} className="mt-12">
              <div className="flex items-center justify-between mb-6 border-b border-ink-700 pb-3">
                <h2 className="text-lg font-bold text-ink-50 uppercase tracking-wide">{cat.name}</h2>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-sm font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {articles.map((a) => (
                  <ArticleCard key={a.slug} a={a} />
                ))}
              </div>
            </section>
          );
        })}

        {/* The Wire — live newsroom feed (TIME | HEADLINE | CATEGORY) */}
        <section className="mt-12">
          <NewsWire initialItems={wireItems} />
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
            <Link href="/heatmap" className="card-hover p-6 group">
              <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Market Heatmap</div>
              <div className="text-sm text-ink-200 leading-relaxed">Visual performance map across crypto, forex, commodities, and equity indices.</div>
              <div className="text-sm text-accent mt-3 font-semibold group-hover:underline flex items-center gap-1">
                View Heatmap <ArrowRight size={13} />
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

        {/* Newsletter CTA */}
        <NewsletterInline />
      </div>
    </div>
  );
}

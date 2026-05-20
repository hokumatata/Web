import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroLead, ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import { NewsletterInline } from "@/components/site/NewsletterInline";

export const revalidate = 60;

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: {
    select: { name: true, authorProfile: { select: { slug: true } } },
  },
} as const;

export default async function HomePage() {
  const [latest, featured, byCategory] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 12,
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
  ]);

  const lead = (featured[0] ?? latest[0]) as ArticleCardData | undefined;
  const subLeads = (featured.slice(1, 4).length >= 3 ? featured.slice(1, 4) : latest.slice(1, 4)) as ArticleCardData[];
  const sideList = latest.slice(4, 10) as ArticleCardData[];

  return (
    <div className="container-mp py-6">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {lead && <HeroLead a={lead} />}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {subLeads.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="card p-4">
            <div className="section-title">
              <h2 className="font-serif text-base">Latest</h2>
              <Link href="/news" className="text-2xs uppercase tracking-wider text-accent hover:underline">
                All news
              </Link>
            </div>
            <div>
              {sideList.map((a) => (
                <ArticleCard key={a.slug} a={a} variant="image-left" />
              ))}
            </div>
          </div>
          <MarketSnapshot />
          <NewsletterInline />
        </aside>
      </section>

      <section className="mt-12 space-y-12">
        {byCategory
          .filter((c) => c.articles.length > 0)
          .map((c) => (
            <div key={c.id}>
              <div className="section-title">
                <div className="flex items-baseline gap-3">
                  <span className="kicker">{c.name}</span>
                  <h2 className="font-serif text-2xl">{c.description ?? c.name}</h2>
                </div>
                <Link
                  href={`/category/${c.slug}`}
                  className="text-2xs uppercase tracking-wider text-accent hover:underline"
                >
                  More {c.name.toLowerCase()}
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
    </div>
  );
}

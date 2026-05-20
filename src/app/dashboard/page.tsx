import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";

export const metadata = { title: "Dashboard" };

export default async function DashboardOverview() {
  const session = (await getSession())!;
  const [savedCount, watchlistCount, recommended] = await Promise.all([
    prisma.savedArticle.count({ where: { userId: session.uid } }),
    prisma.watchlist.count({ where: { userId: session.uid } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: {
        category: { select: { slug: true, name: true } },
        author: { select: { name: true, authorProfile: { select: { slug: true } } } },
      },
    }),
  ]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Saved articles" value={savedCount} href="/dashboard/saved" />
        <Stat label="Watchlist symbols" value={watchlistCount} href="/dashboard/watchlist" />
        <Stat label="Account role" value={session.role} />
      </div>

      <div className="mt-8 section-title">
        <h2>For you</h2>
        <Link href="/news" className="text-2xs uppercase tracking-wider text-accent hover:underline">
          See all news
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommended.map((a) => (
          <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <div className="card p-4">
      <span className="kicker">{label}</span>
      <div className="mt-1 font-serif text-3xl text-white tabular">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

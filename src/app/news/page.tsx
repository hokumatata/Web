import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { Newspaper } from "lucide-react";

export const metadata = { title: "News" };
export const revalidate = 30;

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: { select: { name: true, authorProfile: { select: { slug: true } } } },
} as const;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string; breaking?: string; page?: string };
}) {
  const pageNum = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const perPage = 12;

  const where = {
    status: "PUBLISHED" as const,
    ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
    ...(searchParams.breaking === "1" ? { isBreaking: true } : {}),
  };

  const [articles, total, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
      include: INCLUDE,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper size={20} className="text-accent" />
        <h1 className="text-2xl md:text-3xl font-bold text-ink-50 tracking-tight">
          {searchParams.breaking === "1" ? "Breaking News" : "Latest News"}
        </h1>
        <span className="badge ml-2">{total} articles</span>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/news"
          className={`btn text-xs h-8 ${!searchParams.category ? "btn-primary" : "btn-secondary"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/news?category=${c.slug}`}
            className={`btn text-xs h-8 ${searchParams.category === c.slug ? "btn-primary" : "btn-secondary"}`}
          >
            {c.name}
          </Link>
        ))}
        <Link
          href="/news?breaking=1"
          className={`btn text-xs h-8 ${searchParams.breaking === "1" ? "bg-accent text-ink-950" : "btn-secondary"}`}
        >
          Breaking
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(articles as ArticleCardData[]).map((a) => (
          <ArticleCard key={a.slug} a={a} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-ink-400 text-center py-12">No articles found.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {pageNum > 1 && (
            <Link href={`/news?page=${pageNum - 1}`} className="btn-secondary text-xs h-8">
              Previous
            </Link>
          )}
          <span className="text-sm text-ink-300 px-3">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages && (
            <Link href={`/news?page=${pageNum + 1}`} className="btn-secondary text-xs h-8">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

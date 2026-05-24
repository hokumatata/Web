import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!cat) return { title: "Not found" };
  return { title: cat.name, description: cat.description };
}

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: { select: { name: true, authorProfile: { select: { slug: true } } } },
} as const;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!cat) notFound();

  const pageNum = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const perPage = 12;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", categoryId: cat.id },
      orderBy: { publishedAt: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
      include: INCLUDE,
    }),
    prisma.article.count({ where: { status: "PUBLISHED", categoryId: cat.id } }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="mb-8">
        <span className="kicker">{cat.name}</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">
          {cat.description ?? cat.name}
        </h1>
        <div className="mt-2 text-sm text-ink-300">{total} articles</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(articles as ArticleCardData[]).map((a) => (
          <ArticleCard key={a.slug} a={a} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-ink-400 text-center py-12">No articles in this category yet.</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {pageNum > 1 && (
            <Link href={`/category/${params.slug}?page=${pageNum - 1}`} className="btn-secondary text-xs h-8">
              Previous
            </Link>
          )}
          <span className="text-sm text-ink-300 px-3">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages && (
            <Link href={`/category/${params.slug}?page=${pageNum + 1}`} className="btn-secondary text-xs h-8">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

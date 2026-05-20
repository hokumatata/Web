import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { page?: string; breaking?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const onlyBreaking = searchParams.breaking === "1";

  const where = {
    status: "PUBLISHED",
    ...(onlyBreaking ? { isBreaking: true } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { slug: true, name: true } },
        author: { select: { name: true, authorProfile: { select: { slug: true } } } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-mp py-8">
      <div className="section-title">
        <div>
          <span className="kicker">All coverage</span>
          <h1 className="font-serif text-3xl">News</h1>
        </div>
        <span className="text-2xs uppercase tracking-wider text-ink-300">
          {total} {total === 1 ? "article" : "articles"} {onlyBreaking ? "· breaking" : ""}
        </span>
      </div>

      {articles.length === 0 ? (
        <p className="text-ink-300">No articles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/news" onlyBreaking={onlyBreaking} />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  basePath,
  onlyBreaking,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  onlyBreaking?: boolean;
}) {
  if (totalPages <= 1) return null;
  const make = (n: number) => `${basePath}?page=${n}${onlyBreaking ? "&breaking=1" : ""}`;
  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={make(page - 1)} className="btn-secondary">
          Previous
        </Link>
      ) : (
        <span className="btn-secondary opacity-40 pointer-events-none">Previous</span>
      )}
      <span className="text-sm text-ink-300">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={make(page + 1)} className="btn-secondary">
          Next
        </Link>
      ) : (
        <span className="btn-secondary opacity-40 pointer-events-none">Next</span>
      )}
    </nav>
  );
}

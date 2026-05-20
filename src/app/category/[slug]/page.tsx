import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArticleCard, ArticleCardData, HeroLead } from "@/components/news/ArticleCard";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await prisma.category.findUnique({ where: { slug: params.slug } });
  return { title: c?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const PAGE_SIZE = 18;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", categoryId: category.id },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { slug: true, name: true } },
        author: { select: { name: true, authorProfile: { select: { slug: true } } } },
      },
    }),
    prisma.article.count({ where: { status: "PUBLISHED", categoryId: category.id } }),
  ]);

  const lead = articles[0] as ArticleCardData | undefined;
  const rest = articles.slice(1) as ArticleCardData[];

  return (
    <div className="container-mp py-8">
      <div className="section-title">
        <div>
          <span className="kicker">Category</span>
          <h1 className="font-serif text-3xl">{category.name}</h1>
          {category.description && <p className="text-sm text-ink-300 mt-1">{category.description}</p>}
        </div>
        <span className="text-2xs uppercase tracking-wider text-ink-300">{total} articles</span>
      </div>

      {articles.length === 0 ? (
        <p className="text-ink-300">No articles yet in this category.</p>
      ) : (
        <>
          {lead && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-8">
                <HeroLead a={lead} />
              </div>
              <div className="lg:col-span-4 space-y-2">
                {rest.slice(0, 5).map((a) => (
                  <ArticleCard key={a.slug} a={a} variant="image-left" />
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.slice(5).map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

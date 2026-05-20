import { prisma } from "@/lib/db";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();

  const results = q
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { body: { contains: q } },
            { tags: { some: { tag: { name: { contains: q } } } } },
            { category: { name: { contains: q } } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 60,
        include: {
          category: { select: { slug: true, name: true } },
          author: { select: { name: true, authorProfile: { select: { slug: true } } } },
        },
      })
    : [];

  return (
    <div className="container-mp py-8">
      <form action="/search" className="card p-4 mb-6">
        <label className="label" htmlFor="q">Search</label>
        <div className="flex gap-2">
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search articles, tags, categories"
            className="input"
            autoFocus
          />
          <button className="btn-primary">Search</button>
        </div>
      </form>

      <div className="section-title">
        <div>
          <span className="kicker">Results</span>
          <h1 className="font-serif text-2xl">
            {q ? `"${q}"` : "Enter a query above"}
          </h1>
        </div>
        {q && (
          <span className="text-2xs uppercase tracking-wider text-ink-300">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </span>
        )}
      </div>

      {q && results.length === 0 && (
        <p className="text-ink-300">No matches.</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((a) => (
            <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
          ))}
        </div>
      )}
    </div>
  );
}

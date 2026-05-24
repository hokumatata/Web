import { prisma } from "@/lib/db";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { Search } from "lucide-react";

export const metadata = { title: "Search" };

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: { select: { name: true, authorProfile: { select: { slug: true } } } },
} as const;

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? "";
  let articles: ArticleCardData[] = [];

  if (query.length >= 2) {
    articles = (await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { body: { contains: query } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: INCLUDE,
    })) as ArticleCardData[];
  }

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search size={20} className="text-accent" />
          <h1 className="font-serif text-2xl font-bold text-ink-50">Search</h1>
        </div>
        <form action="/search" className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search articles, markets, tickers..."
            className="input pl-12 h-12 text-base bg-ink-850 border-ink-700"
            autoFocus
          />
        </form>
      </div>

      {query && (
        <div className="mb-4 text-sm text-ink-300">
          {articles.length} result{articles.length !== 1 ? "s" : ""} for &quot;{query}&quot;
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((a) => (
          <ArticleCard key={a.slug} a={a} />
        ))}
      </div>

      {query && articles.length === 0 && (
        <p className="text-ink-400 text-center py-12">No results found. Try a different search term.</p>
      )}
    </div>
  );
}

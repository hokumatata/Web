import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";

export const metadata = { title: "Saved Articles" };

export default async function SavedPage() {
  const session = await getSession();
  if (!session) return null;

  const saved = await prisma.savedArticle.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        include: {
          category: { select: { slug: true, name: true } },
          author: { select: { name: true, authorProfile: { select: { slug: true } } } },
        },
      },
    },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Saved Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {saved.map((s) => (
          <ArticleCard key={s.articleId} a={s.article as unknown as ArticleCardData} />
        ))}
      </div>
      {saved.length === 0 && (
        <p className="text-ink-400 text-center py-12">No saved articles yet. Bookmark articles to find them here.</p>
      )}
    </div>
  );
}

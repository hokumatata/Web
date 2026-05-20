import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";

export const metadata = { title: "Saved articles" };

export default async function SavedPage() {
  const session = (await getSession())!;
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
    <div>
      <div className="section-title">
        <h2>Saved articles</h2>
        <span className="text-2xs uppercase tracking-wider text-ink-300">{saved.length}</span>
      </div>
      {saved.length === 0 ? (
        <p className="text-ink-300">
          Nothing saved yet. Open an{" "}
          <Link href="/news" className="text-accent hover:underline">article</Link>{" "}
          and tap "Save".
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((s) => (
            <ArticleCard key={s.articleId} a={s.article as unknown as ArticleCardData} />
          ))}
        </div>
      )}
    </div>
  );
}

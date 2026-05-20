import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate, readTime, timeAgo } from "@/lib/utils";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { CommentBlock } from "@/components/site/CommentBlock";
import { SaveToggle } from "@/components/site/SaveToggle";
import { getSession } from "@/lib/auth";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const a = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { title: true, excerpt: true },
  });
  return { title: a?.title, description: a?.excerpt };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { slug: true, name: true } },
      author: {
        select: {
          name: true,
          authorProfile: { select: { slug: true, bio: true, avatarUrl: true } },
        },
      },
      tags: { include: { tag: true } },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!article || article.status !== "PUBLISHED") notFound();

  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  const related = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      categoryId: article.categoryId,
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: {
      category: { select: { slug: true, name: true } },
      author: { select: { name: true, authorProfile: { select: { slug: true } } } },
    },
  });

  const html = renderMarkdown(article.body);
  let isSaved = false;
  if (session) {
    isSaved = !!(await prisma.savedArticle.findUnique({
      where: { userId_articleId: { userId: session.uid, articleId: article.id } },
    }));
  }

  return (
    <div className="container-mp py-8">
      <article className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="flex items-center gap-2">
            {article.isBreaking && <span className="badge-accent">Breaking</span>}
            <Link href={`/category/${article.category.slug}`} className="kicker hover:underline">
              {article.category.name}
            </Link>
            <span className="text-2xs text-ink-300">
              {formatDate(article.publishedAt)} · {readTime(article.body)} min read · {article.views.toLocaleString()} views
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight text-balance">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-ink-200 text-pretty">{article.excerpt}</p>
          {article.author && (
            <div className="mt-6 flex items-center gap-3 border-y border-ink-700 py-3">
              {article.author.authorProfile?.avatarUrl && (
                <img
                  src={article.author.authorProfile.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div className="text-sm flex-1">
                <div className="text-white font-medium">{article.author.name}</div>
                <div className="text-2xs text-ink-300">
                  {article.author.authorProfile?.bio ?? "Staff"}
                </div>
              </div>
              {session && <SaveToggle articleId={article.id} initial={isSaved} />}
            </div>
          )}
        </header>

        {article.coverImageUrl && (
          <figure className="mb-8">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full rounded-sm border border-ink-700"
            />
          </figure>
        )}

        <div
          className="prose-mp"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/search?q=${encodeURIComponent(tag.name)}`}
                className="badge hover:bg-ink-700"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        <hr className="rule my-10" />

        <CommentBlock
          articleId={article.id}
          initialComments={article.comments.map((c) => ({
            id: c.id,
            body: c.body,
            createdAt: c.createdAt.toISOString(),
            author: c.user.name,
          }))}
          isAuthed={!!session}
        />
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <div className="section-title">
            <h2 className="font-serif text-xl">Related</h2>
            <Link
              href={`/category/${article.category.slug}`}
              className="text-2xs uppercase tracking-wider text-accent hover:underline"
            >
              More from {article.category.name}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((a) => (
              <ArticleCard key={a.slug} a={a as unknown as ArticleCardData} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

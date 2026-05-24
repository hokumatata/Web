import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, readTime, timeAgo } from "@/lib/utils";
import { CommentBlock } from "@/components/site/CommentBlock";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { Clock, User, Tag, ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return { title: "Not found" };
  return { title: article.title, description: article.excerpt };
}

const INCLUDE = {
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
    orderBy: { createdAt: "desc" as const },
    include: { user: { select: { name: true } } },
  },
} as const;

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: INCLUDE,
  });

  if (!article) notFound();

  const related = (await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      category: { select: { slug: true, name: true } },
      author: { select: { name: true, authorProfile: { select: { slug: true } } } },
    },
  })) as ArticleCardData[];

  const bodyHtml = markdownToHtml(article.body);

  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-2xs text-ink-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={10} /> Home
          </Link>
          <span>/</span>
          <Link href={`/category/${article.category.slug}`} className="hover:text-accent transition-colors">
            {article.category.name}
          </Link>
        </div>

        {/* Article header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {article.isBreaking && (
              <span className="badge-accent flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Breaking
              </span>
            )}
            <Link href={`/category/${article.category.slug}`} className="kicker hover:underline">
              {article.category.name}
            </Link>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
            {article.title}
          </h1>

          <p className="mt-4 text-lg text-ink-200 text-pretty leading-relaxed">{article.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-300 border-t border-b border-ink-800 py-4">
            {article.author && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold text-ink-200">
                  {article.author.name[0]}
                </div>
                <div>
                  <span className="text-ink-100 font-medium">{article.author.name}</span>
                  {article.author.authorProfile?.bio && (
                    <p className="text-2xs text-ink-400 max-w-xs truncate">{article.author.authorProfile.bio}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 text-2xs text-ink-400">
              <Clock size={12} />
              <span>{formatDate(article.publishedAt)} &middot; {timeAgo(article.publishedAt)}</span>
            </div>
            <span className="text-2xs text-ink-400">{readTime(article.body)} min read</span>
            <span className="text-2xs text-ink-500 font-mono">{article.views.toLocaleString()} views</span>
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map(({ tag }) => (
                <span key={tag.id} className="badge flex items-center gap-1">
                  <Tag size={10} /> {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {article.coverImageUrl && (
          <div className="mb-8 overflow-hidden rounded-sm border border-ink-800">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Article body */}
        <div
          className="prose-mp max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Comments */}
        <CommentBlock
          articleId={article.id}
          comments={article.comments.map((c) => ({
            id: c.id,
            body: c.body,
            createdAt: c.createdAt.toISOString(),
            user: { name: c.user.name },
          }))}
        />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mt-16 max-w-4xl mx-auto">
          <div className="section-title">
            <h2 className="font-serif text-lg">Related Coverage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";
import { AI_HUMAN_DISCLOSURE, stripCreditFooters, stripDuplicateTitleHeading } from "@/lib/article-body";
import { formatDate, readTime, timeAgo } from "@/lib/utils";
import { CommentBlock } from "@/components/site/CommentBlock";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { Clock, Tag, ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { newsArticleSchema, breadcrumbSchema, absUrl, absImageUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { category: { select: { name: true } } },
  });
  if (!article) return { title: "Not found" };
  const canonical = absUrl(`/article/${article.slug}`);
  const cover = absImageUrl(article.coverImageUrl);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: canonical,
      images: cover ? [cover] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: cover ? [cover] : undefined,
    },
  };
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

  const authorName = article.author?.name ?? null;
  const authorSlug = article.author?.authorProfile?.slug ?? null;

  const cleanedBody = stripDuplicateTitleHeading(stripCreditFooters(article.body), article.title);
  const bodyHtml = markdownToHtml(cleanedBody);

  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  const articleSchema = newsArticleSchema({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: absImageUrl(article.coverImageUrl) ?? null,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName,
    // Only set author.url when a real profile slug exists (never phantom).
    authorSlug: authorSlug || null,
    categoryName: article.category.name,
  });
  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: article.category.name, path: `/category/${article.category.slug}` },
    { name: article.title, path: `/article/${article.slug}` },
  ]);

  return (
    <div className="container-tw py-8 animate-fade-in">
      <JsonLd data={[articleSchema, crumbs]} />
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-2xs text-ink-400 mb-6">
          <Link href="/" className="hover:text-ink-50 transition-colors flex items-center gap-1">
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

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink-50 leading-tight tracking-tight text-balance">
            {article.title}
          </h1>

          <p className="mt-4 text-lg text-ink-200 text-pretty leading-relaxed">{article.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-300 border-t border-b border-ink-800 py-4">
            {authorName && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold text-ink-200">
                  {authorName[0]}
                </div>
                <div>
                  {authorSlug ? (
                    <Link
                      href={`/author/${authorSlug}`}
                      className="text-ink-100 font-medium hover:text-accent transition-colors"
                    >
                      {authorName}
                    </Link>
                  ) : (
                    <span className="text-ink-100 font-medium">{authorName}</span>
                  )}
                  {article.author?.authorProfile?.bio && (
                    <p className="text-2xs text-ink-400 max-w-xs truncate">{article.author.authorProfile.bio}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 text-2xs text-ink-400">
              <Clock size={12} />
              <span>{formatDate(article.publishedAt)} &middot; {timeAgo(article.publishedAt)}</span>
            </div>
            <span className="text-2xs text-ink-400">{readTime(cleanedBody)} min read</span>
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

        <p className="mt-8 text-xs text-ink-500 leading-relaxed border-t border-ink-800 pt-4">
          {AI_HUMAN_DISCLOSURE}
        </p>

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
            <h2>Related Coverage</h2>
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

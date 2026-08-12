import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";
import { AI_HUMAN_DISCLOSURE, stripCreditFooters } from "@/lib/article-body";
import { formatDate, readTime } from "@/lib/utils";

export const metadata = { title: "Preview Article", robots: { index: false, follow: false } };

/**
 * Editor preview of an article at any status.
 *
 * The public article route serves only PUBLISHED rows, so previewing from the
 * review queue by slug 404s on exactly the drafts a reviewer needs to read.
 * This renders the same markdown through the same prose styles, reading by id
 * and ignoring status.
 *
 * Deliberately not a copy of the public page: no view counter (previewing must
 * not inflate an unpublished article's stats), no comments, no related-articles
 * queries, and noindex so a shared link can never be crawled.
 */
export default async function PreviewArticlePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!article) notFound();

  const cleanedBody = stripCreditFooters(article.body);
  const bodyHtml = markdownToHtml(cleanedBody);
  const isLive = article.status === "PUBLISHED";

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href="/admin/articles/review" className="btn-ghost h-8 px-2 text-xs">
            <ArrowLeft size={13} /> Review queue
          </Link>
          <Link href={`/admin/articles/${article.id}/edit`} className="btn-ghost h-8 px-2 text-xs">
            <Edit size={13} /> Edit
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className={isLive ? "badge-up" : "badge"}>{article.status}</span>
          {isLive && (
            <Link href={`/article/${article.slug}`} className="btn-ghost h-8 px-2 text-xs">
              View live
            </Link>
          )}
        </div>
      </div>

      <p className="text-2xs text-ink-500 mb-4">
        Editor preview — {isLive ? "this article is live" : "not visible to readers"}. Comments,
        related stories and the view counter are omitted.
      </p>

      <div className="card p-6 md:p-8">
        <header className="mb-6">
          <span className="kicker">{article.category.name}</span>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-ink-50 leading-tight tracking-tight mt-2">
            {article.title}
          </h1>
          <p className="mt-3 text-base text-ink-200 leading-relaxed">{article.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-2xs text-ink-400 border-t border-b border-ink-800 py-3">
            <span className="text-ink-100 font-medium">{article.author.name}</span>
            <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
            <span>{readTime(cleanedBody)} min read</span>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {article.tags.map(({ tag }) => (
                <span key={tag.id} className="badge flex items-center gap-1">
                  <Tag size={10} /> {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {article.coverImageUrl ? (
          <div className="mb-6 overflow-hidden rounded-sm border border-ink-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        ) : (
          <p className="mb-6 text-2xs text-ink-500">No cover image set.</p>
        )}

        <div className="prose-mp max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        <p className="mt-8 text-xs text-ink-500 leading-relaxed border-t border-ink-800 pt-4">
          {AI_HUMAN_DISCLOSURE}
        </p>
      </div>
    </div>
  );
}

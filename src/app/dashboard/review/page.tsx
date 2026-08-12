import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isEditor } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Eye, Edit, ShieldCheck, AlertTriangle, Search, Link as LinkIcon } from "lucide-react";
import { ReviewActions } from "@/components/admin/ReviewActions";
import type { DueDiligenceResult } from "@/lib/ai";

export const metadata = { title: "Review Queue" };

function parseDueDiligence(raw: string | null): DueDiligenceResult | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<DueDiligenceResult>;
    if (typeof p.score !== "number" || typeof p.verdict !== "string") return null;
    return {
      score: p.score,
      verdict: p.verdict as DueDiligenceResult["verdict"],
      flags: Array.isArray(p.flags) ? p.flags : [],
      notes: typeof p.notes === "string" ? p.notes : "",
    };
  } catch {
    return null;
  }
}

function verdictStyle(verdict: DueDiligenceResult["verdict"] | undefined) {
  switch (verdict) {
    case "pass":
      return { cls: "badge-up", Icon: ShieldCheck, label: "PASS" };
    case "flag":
      return { cls: "badge-down", Icon: AlertTriangle, label: "FLAG" };
    default:
      return { cls: "badge", Icon: Search, label: "REVIEW" };
  }
}

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const session = await getSession();
  if (!session || !isEditor(session.role)) redirect("/dashboard");

  const categoryFilter = searchParams?.category?.trim() || null;

  const articles = await prisma.article.findMany({
    where: {
      status: "REVIEW",
      ...(categoryFilter ? { category: { slug: categoryFilter } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  // All REVIEW rows (unfiltered) for chip counts / available categories.
  const allReview = await prisma.article.findMany({
    where: { status: "REVIEW" },
    select: { category: { select: { name: true, slug: true } } },
  });

  const categoryCounts = new Map<string, { name: string; slug: string; count: number }>();
  for (const row of allReview) {
    const key = row.category.slug;
    const existing = categoryCounts.get(key);
    if (existing) existing.count += 1;
    else categoryCounts.set(key, { name: row.category.name, slug: row.category.slug, count: 1 });
  }
  const categories = Array.from(categoryCounts.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Source links are editor-only: the published article does not dump rival URLs,
  // so the reviewer needs them here to check the copy against what was reported.
  const sourceItems = await prisma.sourceItem.findMany({
    where: { articleId: { in: articles.map((a) => a.id) } },
    orderBy: { createdAt: "asc" },
  });
  const sourcesByArticle = new Map<string, typeof sourceItems>();
  for (const item of sourceItems) {
    if (!item.articleId) continue;
    const list = sourcesByArticle.get(item.articleId);
    if (list) list.push(item);
    else sourcesByArticle.set(item.articleId, [item]);
  }

  const grouped = new Map<string, { name: string; slug: string; items: typeof articles }>();
  for (const a of articles) {
    const key = a.category.slug;
    const g = grouped.get(key);
    if (g) g.items.push(a);
    else grouped.set(key, { name: a.category.name, slug: a.category.slug, items: [a] });
  }
  const groups = Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-ink-50">Review Queue</h2>
        <span className="badge">
          {categoryFilter
            ? `${articles.length} in filter · ${allReview.length} total`
            : `${articles.length} awaiting review`}
        </span>
      </div>
      <p className="text-sm text-ink-400 mb-4">
        Articles drafted by the journalist agent from public feeds. Each has an
        automated due-diligence check — nothing is published until you approve it.
      </p>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/dashboard/review"
            className={!categoryFilter ? "badge-accent" : "badge hover:bg-ink-800"}
          >
            All ({allReview.length})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/dashboard/review?category=${encodeURIComponent(c.slug)}`}
              className={categoryFilter === c.slug ? "badge-accent" : "badge hover:bg-ink-800"}
            >
              {c.name} ({c.count})
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="card p-8 text-center text-ink-400 text-sm">
          {categoryFilter
            ? "Nothing in this category awaiting review."
            : "Nothing awaiting review. New agent drafts will appear here."}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.slug}>
              <div className="flex items-center justify-between mb-3 border-b border-ink-800 pb-2">
                <h3 className="text-sm font-semibold text-ink-100 tracking-wide uppercase">
                  {group.name}
                </h3>
                <span className="text-2xs text-ink-400 font-mono tabular">{group.items.length}</span>
              </div>
              <div className="flex flex-col gap-4">
                {group.items.map((a) => {
                  const dd = parseDueDiligence(a.dueDiligence);
                  const v = verdictStyle(dd?.verdict);
                  const sources = sourcesByArticle.get(a.id) ?? [];
                  return (
                    <div key={a.id} className="card p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-ink-50 truncate">{a.title}</h3>
                          <p className="text-2xs text-ink-400 mt-0.5">
                            {a.category.name} · {a.author.name} · {timeAgo(a.createdAt)}
                          </p>
                          <p className="text-sm text-ink-300 mt-2 line-clamp-2">{a.excerpt}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`${v.cls} inline-flex items-center gap-1`}>
                            <v.Icon size={12} /> {v.label}
                          </span>
                          {dd && (
                            <span className="text-2xs text-ink-400 font-mono tabular">
                              {dd.score}/100
                            </span>
                          )}
                        </div>
                      </div>

                      {dd && (
                        <div className="rounded-md bg-ink-900 border border-ink-700 p-3 mb-3">
                          <div className="text-2xs uppercase tracking-wider text-ink-400 mb-1">
                            Due diligence
                          </div>
                          {dd.notes && <p className="text-sm text-ink-200">{dd.notes}</p>}
                          {dd.flags.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {dd.flags.map((f, i) => (
                                <li key={i} className="text-2xs text-down flex gap-1.5">
                                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      {!dd && (
                        <p className="text-2xs text-ink-500 mb-3">
                          Automated due-diligence unavailable for this draft — review manually.
                        </p>
                      )}

                      {sources.length > 0 && (
                        <div className="rounded-md bg-ink-900 border border-ink-700 p-3 mb-3">
                          <div className="text-2xs uppercase tracking-wider text-ink-400 mb-1">
                            Sources synthesised ({sources.length})
                          </div>
                          <ul className="space-y-1">
                            {sources.map((s) => (
                              <li key={s.id} className="text-2xs text-ink-300 flex gap-1.5">
                                <LinkIcon size={12} className="mt-0.5 flex-shrink-0 text-ink-500" />
                                <a
                                  href={s.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-ink-50 truncate"
                                >
                                  <span className="text-ink-500">{s.source}:</span> {s.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {/* Not /article/[slug]: that route serves PUBLISHED rows
                              only, so previewing a draft there 404s. */}
                          <Link
                            href={`/dashboard/articles/${a.id}/preview`}
                            className="btn-ghost h-8 px-2 text-xs"
                            title="Preview"
                          >
                            <Eye size={13} /> Preview
                          </Link>
                          <Link
                            href={`/dashboard/articles/${a.id}/edit`}
                            className="btn-ghost h-8 px-2 text-xs"
                            title="Edit"
                          >
                            <Edit size={13} /> Edit
                          </Link>
                        </div>
                        <ReviewActions id={a.id} canPublish />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

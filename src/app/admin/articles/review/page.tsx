import Link from "next/link";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import { Eye, Edit, ShieldCheck, AlertTriangle, Search } from "lucide-react";
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

export default async function ReviewQueuePage() {
  const articles = await prisma.article.findMany({
    where: { status: "REVIEW" },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-ink-50">Review Queue</h2>
        <span className="badge">{articles.length} awaiting review</span>
      </div>
      <p className="text-sm text-ink-400 mb-6">
        Articles drafted by the journalist agent from public feeds. Each has an
        automated due-diligence check — nothing is published until you approve it.
      </p>

      {articles.length === 0 ? (
        <div className="card p-8 text-center text-ink-400 text-sm">
          Nothing awaiting review. New agent drafts will appear here.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((a) => {
            const dd = parseDueDiligence(a.dueDiligence);
            const v = verdictStyle(dd?.verdict);
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

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Link href={`/article/${a.slug}`} className="btn-ghost h-8 px-2 text-xs" title="Preview">
                      <Eye size={13} /> Preview
                    </Link>
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="btn-ghost h-8 px-2 text-xs"
                      title="Edit"
                    >
                      <Edit size={13} /> Edit
                    </Link>
                  </div>
                  <ReviewActions id={a.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

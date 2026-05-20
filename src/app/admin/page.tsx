import Link from "next/link";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [
    articleTotal,
    articlePublished,
    articleDraft,
    commentsPending,
    subscribers,
    users,
    viewsAgg,
    topArticles,
    recentAudit,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count(),
    prisma.user.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = [
    { label: "Articles", value: articleTotal, sub: `${articlePublished} published · ${articleDraft} drafts` },
    { label: "Total views", value: (viewsAgg._sum.views ?? 0).toLocaleString(), sub: "all-time" },
    { label: "Subscribers", value: subscribers, sub: "newsletter" },
    { label: "Pending comments", value: commentsPending, sub: "awaiting moderation" },
    { label: "Users", value: users, sub: "registered" },
  ];

  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Operations</span>
          <h1 className="font-serif text-2xl">Overview</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/articles/new" className="btn-primary">New article</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-3">
            <span className="kicker">{s.label}</span>
            <div className="mt-1 font-serif text-2xl text-white tabular">{s.value}</div>
            <div className="text-2xs text-ink-300">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5">
            <span className="kicker">Top articles</span>
            <Link href="/admin/articles" className="text-2xs uppercase tracking-wider text-accent hover:underline">
              Manage
            </Link>
          </div>
          <ul>
            {topArticles.length === 0 && (
              <li className="px-4 py-4 text-sm text-ink-300">No published articles.</li>
            )}
            {topArticles.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-ink-800 px-4 py-2.5 last:border-b-0">
                <Link href={`/article/${a.slug}`} className="text-sm text-ink-100 hover:text-accent line-clamp-1">
                  {a.title}
                </Link>
                <span className="text-2xs tabular text-ink-300">{a.views.toLocaleString()} views</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5">
            <span className="kicker">Recent activity</span>
            <Link href="/admin/audit-log" className="text-2xs uppercase tracking-wider text-accent hover:underline">
              All
            </Link>
          </div>
          <ul>
            {recentAudit.length === 0 && (
              <li className="px-4 py-4 text-sm text-ink-300">No activity yet.</li>
            )}
            {recentAudit.map((a) => (
              <li key={a.id} className="border-b border-ink-800 px-4 py-2.5 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ink-100">{a.action}</span>
                  <span className="text-2xs text-ink-300">{timeAgo(a.createdAt)}</span>
                </div>
                <div className="text-2xs text-ink-300 truncate">
                  {a.actor?.name ? `${a.actor.name} · ${a.target ?? "—"}` : a.target ?? "—"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

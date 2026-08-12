import { getSession } from "@/lib/auth";
import { canPublish, isAuthor, isEditor } from "@/lib/types";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Bookmark, Eye, Settings, FileText, Plus, TrendingUp, ClipboardCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const showWriting = isAuthor(session.role) || isEditor(session.role);

  const [savedCount, watchlistCount] = await Promise.all([
    prisma.savedArticle.count({ where: { userId: session.uid } }),
    prisma.watchlist.count({ where: { userId: session.uid } }),
  ]);

  const cards = [
    { label: "Saved Articles", value: savedCount, href: "/dashboard/saved", icon: Bookmark },
    { label: "Watchlist Items", value: watchlistCount, href: "/dashboard/watchlist", icon: Eye },
    { label: "Preferences", value: "Configure", href: "/dashboard/preferences", icon: Settings },
  ];

  // Author stats
  let authorArticles: { id: string; title: string; slug: string; status: string; views: number; updatedAt: Date }[] = [];
  let publishedCount = 0;
  let draftCount = 0;
  let totalViews = 0;

  if (showWriting) {
    authorArticles = await prisma.article.findMany({
      where: { authorId: session.uid },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, status: true, views: true, updatedAt: true },
    });

    const allArticles = await prisma.article.findMany({
      where: { authorId: session.uid },
      select: { status: true, views: true },
    });
    publishedCount = allArticles.filter((a) => a.status === "PUBLISHED").length;
    draftCount = allArticles.filter((a) => a.status === "DRAFT").length;
    totalViews = allArticles.reduce((sum, a) => sum + a.views, 0);
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Your Dashboard</h2>

      {(canPublish(session.role) || isEditor(session.role)) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/dashboard/articles/new" className="btn-primary text-xs h-8">
            <Plus size={14} /> Write Article
          </Link>
          <Link href="/dashboard/articles" className="btn-ghost text-xs h-8">
            <FileText size={14} /> My Articles
          </Link>
          {isEditor(session.role) && (
            <Link href="/admin/articles/review" className="btn-ghost text-xs h-8">
              <ClipboardCheck size={14} /> Review Queue
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card-hover p-5 group">
            <c.icon size={20} className="text-accent mb-3" />
            <div className="data-label">{c.label}</div>
            <div className="text-lg font-semibold text-ink-50">{c.value}</div>
          </Link>
        ))}
      </div>

      {showWriting && (
        <div className="mt-8">
          <div className="section-title">
            <h2 className="flex items-center gap-2">
              <FileText size={16} className="text-accent" />
              Your Articles
            </h2>
            <Link href="/dashboard/articles" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>

          {/* Author stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <div className="data-label">Published</div>
              <div className="text-lg font-semibold text-up tabular">{publishedCount}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="data-label">Drafts</div>
              <div className="text-lg font-semibold text-accent tabular">{draftCount}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="data-label">Total Views</div>
              <div className="text-lg font-semibold text-ink-50 tabular">{totalViews.toLocaleString()}</div>
            </div>
          </div>

          {authorArticles.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-ink-300 mb-4">You haven&apos;t written any articles yet. Start writing!</p>
              <Link href="/dashboard/articles/new" className="btn-primary text-xs h-8">
                <Plus size={14} /> Write Your First Article
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {authorArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/articles/${a.id}/edit`}
                  className="card-hover p-4 flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink-100 truncate group-hover:text-ink-50 transition-colors">{a.title}</div>
                    <div className="text-2xs text-ink-400 mt-0.5">{timeAgo(a.updatedAt)}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className={a.status === "PUBLISHED" ? "badge-up" : "badge"}>
                      {a.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-400 font-mono tabular">
                      <TrendingUp size={12} />
                      {a.views}
                    </span>
                  </div>
                </Link>
              ))}
              <div className="flex justify-center pt-2">
                <Link href="/dashboard/articles/new" className="btn-primary text-xs h-8">
                  <Plus size={14} /> Write Article
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

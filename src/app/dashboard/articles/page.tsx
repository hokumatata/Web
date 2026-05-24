import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import { Plus, Edit, Eye, FileText } from "lucide-react";
import { ArticleRowActions } from "@/components/admin/ArticleRowActions";

export const metadata = { title: "My Articles" };

export default async function AuthorArticlesPage() {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "AUTHOR")) redirect("/login");

  const articles = await prisma.article.findMany({
    where: { authorId: session.uid },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
    },
  });

  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold text-ink-50">My Articles</h2>
        <Link href="/dashboard/articles/new" className="btn-primary text-xs h-8">
          <Plus size={14} /> Write Article
        </Link>
      </div>

      {/* Stats */}
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

      {articles.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="text-ink-500 mx-auto mb-3" />
          <p className="text-ink-300 mb-4">You haven&apos;t written any articles yet.</p>
          <Link href="/dashboard/articles/new" className="btn-primary text-xs h-8">
            <Plus size={14} /> Write Your First Article
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-850">
                <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Views</th>
                <th className="text-right px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-ink-800/50 hover:bg-ink-850 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-100 truncate max-w-xs">{a.title}</div>
                    <div className="text-2xs text-ink-400">{timeAgo(a.updatedAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-300 hidden md:table-cell">{a.category.name}</td>
                  <td className="px-4 py-3">
                    <span className={a.status === "PUBLISHED" ? "badge-up" : a.status === "DRAFT" ? "badge" : "badge-down"}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-ink-300 tabular">{a.views}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.status === "PUBLISHED" && (
                        <Link href={`/article/${a.slug}`} className="btn-ghost h-7 px-2"><Eye size={13} /></Link>
                      )}
                      <Link href={`/dashboard/articles/${a.id}/edit`} className="btn-ghost h-7 px-2"><Edit size={13} /></Link>
                      <ArticleRowActions id={a.id} status={a.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

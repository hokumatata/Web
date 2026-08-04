import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/utils";
import { Plus, Edit, Eye, Sparkles } from "lucide-react";
import { ArticleRowActions } from "@/components/admin/ArticleRowActions";

export const metadata = { title: "Manage Articles" };

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink-50">Articles</h2>
        <div className="flex items-center gap-2">
          <Link href="/admin/articles/ai" className="btn-ghost text-xs h-8">
            <Sparkles size={14} /> AI Compose
          </Link>
          <Link href="/admin/articles/new" className="btn-primary text-xs h-8">
            <Plus size={14} /> New Article
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-850">
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium hidden lg:table-cell">Author</th>
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
                <td className="px-4 py-3 text-ink-300 hidden lg:table-cell">{a.author.name}</td>
                <td className="px-4 py-3">
                  <span className={a.status === "PUBLISHED" ? "badge-up" : a.status === "REVIEW" ? "badge-down" : "badge"}>
                    {a.status === "REVIEW" ? "IN REVIEW" : a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-ink-300 tabular">{a.views}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/article/${a.slug}`} className="btn-ghost h-7 px-2"><Eye size={13} /></Link>
                    <Link href={`/admin/articles/${a.id}/edit`} className="btn-ghost h-7 px-2"><Edit size={13} /></Link>
                    <ArticleRowActions id={a.id} status={a.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

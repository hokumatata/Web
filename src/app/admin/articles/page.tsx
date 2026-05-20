import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ArticleRowActions } from "@/components/admin/ArticleRowActions";

export const metadata = { title: "Admin · Articles" };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status.toUpperCase();
  if (searchParams.q)
    where.OR = [
      { title: { contains: searchParams.q } },
      { excerpt: { contains: searchParams.q } },
    ];
  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Content</span>
          <h1 className="font-serif text-2xl">Articles</h1>
        </div>
        <Link href="/admin/articles/new" className="btn-primary">New article</Link>
      </div>

      <form className="card p-3 mb-4 flex flex-wrap items-end gap-3" action="/admin/articles">
        <div>
          <label className="label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={searchParams.q ?? ""} className="input w-72" />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={searchParams.status ?? ""} className="input">
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <button className="btn-secondary">Apply</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Author</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Updated</th>
              <th className="px-4 py-2 text-right">Views</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-300">No articles.</td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-ink-800 last:border-b-0">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/articles/${a.id}/edit`} className="text-ink-100 hover:text-accent">
                    {a.title}
                  </Link>
                  <div className="text-2xs text-ink-300">/{a.slug}</div>
                </td>
                <td className="px-4 py-2.5 text-ink-200">{a.category.name}</td>
                <td className="px-4 py-2.5 text-ink-200">{a.author.name}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      a.status === "PUBLISHED"
                        ? "badge-up"
                        : a.status === "ARCHIVED"
                        ? "badge"
                        : "badge-accent"
                    }
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-2xs text-ink-300 tabular">{formatDate(a.updatedAt)}</td>
                <td className="px-4 py-2.5 text-right tabular text-ink-100">{a.views.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right">
                  <ArticleRowActions id={a.id} slug={a.slug} status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

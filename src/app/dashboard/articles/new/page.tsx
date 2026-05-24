import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";
import { prisma } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata = { title: "Write Article" };

export default async function AuthorNewArticlePage() {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "AUTHOR")) redirect("/login");

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Write Article</h2>
      <div className="card p-6">
        <ArticleForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          redirectTo="/dashboard/articles"
        />
      </div>
    </div>
  );
}

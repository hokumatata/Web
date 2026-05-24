import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata = { title: "Edit Article" };

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: { tags: { select: { tagId: true } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Edit Article</h2>
      <div className="card p-6">
        <ArticleForm
          article={{
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            body: article.body,
            categoryId: article.categoryId,
            coverImageUrl: article.coverImageUrl ?? "",
            isFeatured: article.isFeatured,
            isBreaking: article.isBreaking,
            tags: article.tags.map((t) => t.tagId),
          }}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </div>
  );
}

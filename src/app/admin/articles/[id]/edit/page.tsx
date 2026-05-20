import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata = { title: "Admin · Edit article" };

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();
  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Edit</span>
          <h1 className="font-serif text-2xl line-clamp-1">{article.title}</h1>
        </div>
      </div>
      <ArticleForm
        mode="edit"
        articleId={article.id}
        initial={{
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          coverImageUrl: article.coverImageUrl ?? "",
          categoryId: article.categoryId,
          status: article.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
          isFeatured: article.isFeatured,
          isBreaking: article.isBreaking,
          tagIds: article.tags.map((t) => t.tagId),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}

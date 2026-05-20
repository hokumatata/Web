import { prisma } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata = { title: "Admin · Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const items = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Taxonomy</span>
          <h1 className="font-serif text-2xl">Categories</h1>
        </div>
      </div>
      <CategoriesManager
        items={items.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          order: c.order,
          articleCount: c._count.articles,
        }))}
      />
    </div>
  );
}

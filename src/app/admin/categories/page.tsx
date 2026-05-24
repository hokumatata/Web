import { prisma } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata = { title: "Manage Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Categories</h2>
      <CategoriesManager categories={categories} />
    </div>
  );
}

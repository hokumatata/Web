import { prisma } from "@/lib/db";
import { TagsManager } from "@/components/admin/TagsManager";

export const metadata = { title: "Admin · Tags" };
export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const items = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Taxonomy</span>
          <h1 className="font-serif text-2xl">Tags</h1>
        </div>
      </div>
      <TagsManager
        items={items.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          articleCount: t._count.articles,
        }))}
      />
    </div>
  );
}

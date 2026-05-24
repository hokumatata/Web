import { prisma } from "@/lib/db";
import { TagsManager } from "@/components/admin/TagsManager";

export const metadata = { title: "Manage Tags" };

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Tags</h2>
      <TagsManager tags={tags} />
    </div>
  );
}

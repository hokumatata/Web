import { prisma } from "@/lib/db";
import { AiComposePanel } from "@/components/admin/AiComposePanel";

export const metadata = { title: "AI Compose Article" };

export default async function AiComposePage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">AI Compose from Sources</h2>
      <div className="card p-6">
        <AiComposePanel
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </div>
  );
}

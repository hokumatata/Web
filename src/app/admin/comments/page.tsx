import { prisma } from "@/lib/db";
import { CommentsModeration } from "@/components/admin/CommentsModeration";

export const metadata = { title: "Moderate Comments" };

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Comments</h2>
      <CommentsModeration
        comments={comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

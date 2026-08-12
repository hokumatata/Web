import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isEditor } from "@/lib/types";
import { CommentsModeration } from "@/components/admin/CommentsModeration";

export const metadata = { title: "Moderate Comments" };

export default async function DashboardCommentsPage() {
  const session = await getSession();
  if (!session || !isEditor(session.role)) redirect("/dashboard");

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Comments</h2>
      <CommentsModeration
        comments={comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

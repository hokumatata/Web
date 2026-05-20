import { prisma } from "@/lib/db";
import { CommentsModeration } from "@/components/admin/CommentsModeration";

export const metadata = { title: "Admin · Comments" };
export const dynamic = "force-dynamic";

export default async function AdminCommentsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status?.toUpperCase();
  const where = status && ["PENDING", "APPROVED", "REJECTED", "SPAM"].includes(status) ? { status } : {};
  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      article: { select: { title: true, slug: true } },
    },
  });
  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Moderation</span>
          <h1 className="font-serif text-2xl">Comments</h1>
        </div>
      </div>
      <CommentsModeration
        items={comments.map((c) => ({
          id: c.id,
          body: c.body,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
          authorName: c.user.name,
          authorEmail: c.user.email,
          articleTitle: c.article.title,
          articleSlug: c.article.slug,
        }))}
        initialStatus={status ?? ""}
      />
    </div>
  );
}

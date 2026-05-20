import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, forbidden } from "@/lib/api";

export async function GET() {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);

  const [
    articleTotal,
    articlePublished,
    articleDraft,
    commentsPending,
    subscribers,
    users,
    viewsAgg,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count(),
    prisma.user.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
  ]);

  return ok({
    articleTotal,
    articlePublished,
    articleDraft,
    commentsPending,
    subscribers,
    users,
    totalViews: viewsAgg._sum.views ?? 0,
  });
}

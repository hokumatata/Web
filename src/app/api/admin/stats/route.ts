import { prisma } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  const [articles, users, comments, subscribers] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return json({ articles, users, comments, subscribers });
}

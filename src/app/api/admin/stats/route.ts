import { prisma } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { requireExactRole } from "@/lib/auth";

export async function GET() {
  const auth = await requireExactRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const [articles, users, comments, subscribers] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return json({ articles, users, comments, subscribers });
}

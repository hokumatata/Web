import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { json, unauthorized, forbidden, notFound } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { canPublish, isEditor } from "@/lib/types";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();
  // Exact-role gate: ADMIN must not publish (roleAtLeast would let them through).
  if (!canPublish(session.role)) return forbidden();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  // Authors may only publish their own work; editors may publish any eligible article.
  if (!isEditor(session.role) && article.authorId !== session.uid) {
    return forbidden();
  }

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  revalidateTag("articles");
  revalidatePath("/sitemap.xml");
  revalidatePath("/news-sitemap.xml");
  return json(updated);
}

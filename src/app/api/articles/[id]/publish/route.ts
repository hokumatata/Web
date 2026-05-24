import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { json, unauthorized, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  revalidateTag("articles");
  return json(updated);
}

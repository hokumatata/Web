import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      author: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!article) return notFound("Article");
  return json(article);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("AUTHOR");
  if (!auth.ok) return unauthorized();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  const body = await req.json();
  const { title, excerpt, bodyText, categoryId, coverImageUrl, isFeatured, isBreaking, status, tags } = body;

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(excerpt !== undefined ? { excerpt } : {}),
      ...(bodyText !== undefined ? { body: bodyText } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(isBreaking !== undefined ? { isBreaking } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  if (tags && Array.isArray(tags)) {
    await prisma.articleTag.deleteMany({ where: { articleId: params.id } });
    for (const tagId of tags) {
      await prisma.articleTag.create({ data: { articleId: params.id, tagId } }).catch(() => {});
    }
  }

  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  await prisma.article.delete({ where: { id: params.id } }).catch(() => {});
  return json({ ok: true });
}

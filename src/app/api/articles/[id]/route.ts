import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import { fromZodError, ok, notFound, forbidden } from "@/lib/api";
import { ARTICLE_STATUSES } from "@/lib/types";
import { audit } from "@/lib/audit";

const Body = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().min(10).max(400).optional(),
  body: z.string().min(20).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().min(1).optional(),
  status: z.enum(ARTICLE_STATUSES).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

async function canEdit(articleAuthorId: string) {
  const editor = await requireRole("EDITOR");
  if (editor.ok) return { ok: true as const, session: editor.session };
  const session = await getSession();
  if (!session) return { ok: false as const };
  if (session.uid === articleAuthorId) return { ok: true as const, session };
  return { ok: false as const };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const a = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { slug: true, name: true } },
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!a) return notFound();
  return ok(a);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();
  const gate = await canEdit(existing.authorId);
  if (!gate.ok) return forbidden();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  if (data.status === "PUBLISHED") {
    const editor = await requireRole("EDITOR");
    if (!editor.ok) delete data.status;
  }

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
      ...(data.body !== undefined ? { body: data.body } : {}),
      ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.status === "PUBLISHED" && !existing.publishedAt ? { publishedAt: new Date() } : {}),
      ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
      ...(data.isBreaking !== undefined ? { isBreaking: data.isBreaking } : {}),
    },
  });

  if (data.tagIds) {
    await prisma.articleTag.deleteMany({ where: { articleId: params.id } });
    if (data.tagIds.length > 0) {
      await prisma.articleTag.createMany({
        data: data.tagIds.map((tagId) => ({ articleId: params.id, tagId })),
      });
    }
  }

  await audit(gate.session.uid, "article.update", params.id, { fields: Object.keys(data) });
  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();
  await prisma.article.delete({ where: { id: params.id } });
  await audit(gate.session.uid, "article.delete", params.id);
  return ok({ ok: true });
}

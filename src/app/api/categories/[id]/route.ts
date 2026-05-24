import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const cat = await prisma.category.findUnique({ where: { id: params.id } });
  if (!cat) return notFound("Category");

  const body = await req.json();
  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    },
  });

  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const articleCount = await prisma.article.count({ where: { categoryId: params.id } });
  if (articleCount > 0) return error("Cannot delete category with articles");

  await prisma.category.delete({ where: { id: params.id } });
  return json({ ok: true });
}

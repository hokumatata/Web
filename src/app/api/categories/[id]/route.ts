import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, notFound, forbidden, badRequest } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { audit } from "@/lib/audit";

const Body = z.object({
  name: z.string().min(1).max(60).optional(),
  slug: z.string().min(1).max(80).optional(),
  description: z.string().max(400).optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);
  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;
  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: slugify(data.slug) } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
    },
  });
  await audit(gate.session.uid, "category.update", params.id);
  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const existing = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { articles: true } } },
  });
  if (!existing) return notFound();
  if (existing._count.articles > 0) return badRequest("category has articles; reassign first");
  await prisma.category.delete({ where: { id: params.id } });
  await audit(gate.session.uid, "category.delete", params.id);
  return ok({ ok: true });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isRole } from "@/lib/types";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return notFound("User");

  const body = await req.json();

  if (body.role && !isRole(body.role)) return error("Invalid role");

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(body.role ? { role: body.role } : {}),
      ...(body.name ? { name: body.name } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  if (params.id === auth.session.uid) return error("Cannot delete yourself");

  await prisma.user.delete({ where: { id: params.id } }).catch(() => {});
  return json({ ok: true });
}

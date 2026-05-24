import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  const { status } = await req.json();
  if (!["APPROVED", "REJECTED", "SPAM"].includes(status)) {
    return json({ error: "Invalid status" }, 400);
  }

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { status },
  });

  return json(comment);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  await prisma.comment.delete({ where: { id: params.id } }).catch(() => {});
  return json({ ok: true });
}

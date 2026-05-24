import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  await prisma.tag.delete({ where: { id: params.id } }).catch(() => {});
  return json({ ok: true });
}

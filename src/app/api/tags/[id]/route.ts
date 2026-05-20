import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, notFound, forbidden } from "@/lib/api";
import { audit } from "@/lib/audit";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const t = await prisma.tag.findUnique({ where: { id: params.id } });
  if (!t) return notFound();
  await prisma.articleTag.deleteMany({ where: { tagId: params.id } });
  await prisma.tag.delete({ where: { id: params.id } });
  await audit(gate.session.uid, "tag.delete", params.id);
  return ok({ ok: true });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, notFound, forbidden } from "@/lib/api";
import { COMMENT_STATUSES } from "@/lib/types";
import { audit } from "@/lib/audit";

const Body = z.object({ status: z.enum(COMMENT_STATUSES) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);
  const c = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!c) return notFound();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const updated = await prisma.comment.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  await audit(gate.session.uid, "comment.moderate", params.id, { status: parsed.data.status });
  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const c = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!c) return notFound();
  await prisma.comment.delete({ where: { id: params.id } });
  await audit(gate.session.uid, "comment.delete", params.id);
  return ok({ ok: true });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, notFound, forbidden, badRequest } from "@/lib/api";
import { ROLES } from "@/lib/types";
import { audit } from "@/lib/audit";

const Body = z.object({
  role: z.enum(ROLES).optional(),
  name: z.string().min(1).max(80).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const u = await prisma.user.findUnique({ where: { id: params.id } });
  if (!u) return notFound();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);

  if (parsed.data.role && parsed.data.role !== "ADMIN" && u.id === gate.session.uid) {
    return badRequest("you cannot demote yourself");
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
    },
  });
  await audit(gate.session.uid, "user.update", u.id, parsed.data);
  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  if (params.id === gate.session.uid) return badRequest("you cannot delete yourself");
  const u = await prisma.user.findUnique({ where: { id: params.id } });
  if (!u) return notFound();
  await prisma.user.delete({ where: { id: params.id } });
  await audit(gate.session.uid, "user.delete", u.id, { email: u.email });
  return ok({ ok: true });
}

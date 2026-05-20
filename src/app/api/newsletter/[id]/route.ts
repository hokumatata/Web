import { prisma } from "@/lib/db";
import { ok, forbidden, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { id: params.id } });
  if (!sub) return notFound();
  await prisma.newsletterSubscriber.delete({ where: { id: params.id } });
  await audit(gate.session.uid, "newsletter.delete", sub.id, { email: sub.email });
  return ok({ ok: true });
}

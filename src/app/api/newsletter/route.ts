import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fromZodError, ok, badRequest, forbidden, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";

const SubBody = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = SubBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return ok({ ok: true, alreadySubscribed: true });
  const sub = await prisma.newsletterSubscriber.create({ data: { email } });
  await audit(null, "newsletter.subscribe", sub.id, { email });
  return ok({ ok: true });
}

export async function GET() {
  const gate = await requireRole("ADMIN");
  if (!gate.ok) return forbidden(gate.reason);
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ subs });
}

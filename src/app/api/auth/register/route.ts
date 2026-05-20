import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { fromZodError, ok, badRequest } from "@/lib/api";

const Body = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email: normalized } });
  if (exists) return badRequest("email already registered");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalized,
      passwordHash,
      role: "READER",
      preferences: { create: {} },
    },
  });
  await audit(user.id, "user.register", user.id);
  await setSessionCookie({ uid: user.id, role: "READER", name: user.name, email: user.email });
  return ok({ id: user.id, email: user.email, role: user.role, name: user.name });
}

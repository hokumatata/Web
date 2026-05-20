import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { fromZodError, badRequest, ok, unauthorized } from "@/lib/api";
import type { Role } from "@/lib/types";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return unauthorized("invalid credentials");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return unauthorized("invalid credentials");

  await setSessionCookie({
    uid: user.id,
    role: user.role as Role,
    name: user.name,
    email: user.email,
  });

  return ok({ id: user.id, email: user.email, role: user.role, name: user.name });
}

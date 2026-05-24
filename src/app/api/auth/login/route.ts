import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error } from "@/lib/api";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { isRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return error("Email and password are required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return error("Invalid credentials", 401);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return error("Invalid credentials", 401);

  if (!isRole(user.role)) return error("Invalid user role", 500);

  await setSessionCookie({ uid: user.id, role: user.role, name: user.name, email: user.email });

  return json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}

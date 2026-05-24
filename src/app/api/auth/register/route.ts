import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error } from "@/lib/api";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) return error("All fields are required");
  if (password.length < 6) return error("Password must be at least 6 characters");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error("Email already registered", 409);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: "READER" },
  });

  await setSessionCookie({ uid: user.id, role: "READER", name: user.name, email: user.email });

  return json({ ok: true, user: { id: user.id, name: user.name, role: user.role } }, 201);
}

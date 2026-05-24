import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole, hashPassword } from "@/lib/auth";
import { isRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) return error("Name, email, and password are required");
  if (password.length < 6) return error("Password must be at least 6 characters");

  const assignRole = role || "READER";
  if (!isRole(assignRole)) return error("Invalid role");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error("Email already registered", 409);

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: assignRole },
    select: { id: true, name: true, email: true, role: true },
  });

  return json(user, 201);
}

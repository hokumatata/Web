import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) return error("Name, email, and password are required");
  if (password.length < 6) return error("Password must be at least 6 characters");

  // Readers panel only creates READER accounts. Editorial roles go through /api/admin/authors.
  if (role !== undefined && role !== null && role !== "READER") {
    return error("This endpoint only creates READER accounts. Use Authors to create editors or authors.", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error("Email already registered", 409);

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: "READER" },
    select: { id: true, name: true, email: true, role: true },
  });

  return json(user, 201);
}

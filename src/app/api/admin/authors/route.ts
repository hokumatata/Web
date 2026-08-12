import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireExactRole, hashPassword } from "@/lib/auth";
import { isRole } from "@/lib/types";

export async function GET() {
  const auth = await requireExactRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const authors = await prisma.user.findMany({
    where: { role: { in: ["AUTHOR", "EDITOR", "ADMIN"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      authorProfile: {
        select: { slug: true, bio: true, avatarUrl: true, twitter: true },
      },
      _count: { select: { articles: true } },
    },
  });

  return json(authors);
}

export async function POST(req: NextRequest) {
  const auth = await requireExactRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const body = await req.json();
  const { name, email, password, role, bio, twitter } = body;

  if (!name || !email || !password) return error("Name, email, and password are required");
  if (password.length < 6) return error("Password must be at least 6 characters");

  const assignRole = role || "AUTHOR";
  if (!isRole(assignRole)) return error("Invalid role");
  if (assignRole === "ADMIN") return error("Cannot create admin users");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error("Email already registered", 409);

  const passwordHash = await hashPassword(password);
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: assignRole,
      authorProfile: {
        create: {
          slug,
          bio: bio || null,
          twitter: twitter || null,
        },
      },
    },
    include: {
      authorProfile: {
        select: { slug: true, bio: true, avatarUrl: true, twitter: true },
      },
    },
  });

  return json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      authorProfile: user.authorProfile,
    },
    201,
  );
}

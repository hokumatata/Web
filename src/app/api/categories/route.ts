import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return json(categories);
}

export async function POST(req: NextRequest) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const { name, description } = await req.json();
  if (!name) return error("Name is required");

  const slug = slugify(name);
  const category = await prisma.category.create({
    data: { slug, name, description: description ?? null },
  });

  return json(category, 201);
}

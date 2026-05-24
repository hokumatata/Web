import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return json(tags);
}

export async function POST(req: NextRequest) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  const { name } = await req.json();
  if (!name) return error("Name is required");

  const slug = slugify(name);
  const tag = await prisma.tag.create({ data: { slug, name } });
  return json(tag, 201);
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, forbidden, badRequest } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { audit } from "@/lib/audit";

export async function GET() {
  const items = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return ok({ items });
}

const Body = z.object({
  name: z.string().min(1).max(40),
});

export async function POST(req: NextRequest) {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const slug = slugify(parsed.data.name);
  if (!slug) return badRequest("invalid name");
  if (await prisma.tag.findUnique({ where: { slug } }))
    return badRequest("tag exists");
  const t = await prisma.tag.create({ data: { name: parsed.data.name, slug } });
  await audit(gate.session.uid, "tag.create", t.id);
  return ok(t);
}

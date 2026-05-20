import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, badRequest, forbidden } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { audit } from "@/lib/audit";

export async function GET() {
  const items = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

const Body = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(80).optional(),
  description: z.string().max(400).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const slug = slugify(parsed.data.slug ?? parsed.data.name);
  if (!slug) return badRequest("invalid slug");
  if (await prisma.category.findUnique({ where: { slug } }))
    return badRequest("slug already exists");
  const c = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      order: parsed.data.order,
    },
  });
  await audit(gate.session.uid, "category.create", c.id);
  return ok(c);
}

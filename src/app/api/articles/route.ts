import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, badRequest, forbidden } from "@/lib/api";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { ARTICLE_STATUSES } from "@/lib/types";

const ListQuery = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  status: z.enum(ARTICLE_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = ListQuery.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return fromZodError(parsed.error);
  const { category, tag, q, status, page, limit } = parsed.data;

  let effectiveStatus = status;
  if (!effectiveStatus) {
    effectiveStatus = "PUBLISHED";
  } else if (effectiveStatus !== "PUBLISHED") {
    const gate = await requireRole("EDITOR");
    if (!gate.ok) effectiveStatus = "PUBLISHED";
  }

  const where: Record<string, unknown> = { status: effectiveStatus };
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (q)
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { body: { contains: q } },
    ];

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { slug: true, name: true } },
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return ok({ items, total, page, limit });
}

const CreateBody = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().min(10).max(400),
  body: z.string().min(20),
  coverImageUrl: z.string().url().optional().nullable(),
  categoryId: z.string().min(1),
  status: z.enum(ARTICLE_STATUSES).default("DRAFT"),
  isFeatured: z.boolean().optional().default(false),
  isBreaking: z.boolean().optional().default(false),
  tagIds: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const gate = await requireRole("AUTHOR");
  if (!gate.ok) return forbidden(gate.reason);

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  // AUTHOR can't directly publish — must be EDITOR+
  if (data.status === "PUBLISHED") {
    const editor = await requireRole("EDITOR");
    if (!editor.ok) data.status = "DRAFT";
  }

  let baseSlug = slugify(data.title);
  if (!baseSlug) baseSlug = `article-${Date.now()}`;
  let slug = baseSlug;
  let n = 2;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const created = await prisma.article.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImageUrl: data.coverImageUrl ?? null,
      categoryId: data.categoryId,
      status: data.status,
      isFeatured: data.isFeatured,
      isBreaking: data.isBreaking,
      authorId: gate.session.uid,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
  });

  await audit(gate.session.uid, "article.create", created.id, { status: created.status });
  return ok(created);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "PUBLISHED";
  const category = url.searchParams.get("category");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(50, parseInt(url.searchParams.get("perPage") ?? "20", 10));

  const where = {
    status,
    ...(category ? { category: { slug: category } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: { select: { slug: true, name: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return json({ articles, total, page, perPage });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole("AUTHOR");
  if (!auth.ok) return unauthorized();

  const body = await req.json();
  const { title, excerpt, bodyText, categoryId, coverImageUrl, thumbnailUrl, isFeatured, isBreaking, tags } = body;
  if (!title || !excerpt || !bodyText || !categoryId) return error("Missing required fields");

  const slug = slugify(title) + "-" + Date.now().toString(36);

  const article = await prisma.article.create({
    data: {
      slug,
      title,
      excerpt,
      body: bodyText,
      categoryId,
      authorId: auth.session.uid,
      coverImageUrl: coverImageUrl ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      isFeatured: isFeatured ?? false,
      isBreaking: isBreaking ?? false,
      status: "DRAFT",
    },
  });

  if (tags && Array.isArray(tags)) {
    for (const tagId of tags) {
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId },
      }).catch(() => {});
    }
  }

  return json(article, 201);
}

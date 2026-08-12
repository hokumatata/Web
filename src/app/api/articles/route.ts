import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, forbidden } from "@/lib/api";
import { requireExactRoles } from "@/lib/auth";
import { isEditor } from "@/lib/types";
import { slugify } from "@/lib/utils";

const PUBLIC_STATUSES = new Set(["PUBLISHED"]);
const STAFF_STATUSES = new Set(["PUBLISHED", "DRAFT", "REVIEW"]);

/** Drop staff-only fields from payloads returned to anonymous/public readers. */
function toPublicArticle<T extends Record<string, unknown>>(article: T) {
  const { dueDiligence: _dd, ...rest } = article;
  if (rest.author && typeof rest.author === "object" && rest.author !== null) {
    const { email: _email, ...authorRest } = rest.author as Record<string, unknown>;
    return { ...rest, author: authorRest };
  }
  return rest;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "PUBLISHED";
  const category = url.searchParams.get("category");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(50, parseInt(url.searchParams.get("perPage") ?? "20", 10));

  if (!STAFF_STATUSES.has(status)) {
    return error("Invalid status", 400);
  }

  const isPublic = PUBLIC_STATUSES.has(status);
  let authorIdFilter: string | undefined;

  if (!isPublic) {
    const auth = await requireExactRoles(["AUTHOR", "EDITOR"]);
    if (!auth.ok) {
      return auth.reason === "forbidden" ? forbidden() : unauthorized();
    }
    // Authors only see their own unpublished work; editors see all.
    if (!isEditor(auth.session.role)) {
      authorIdFilter = auth.session.uid;
    }
  }

  const where = {
    status,
    ...(authorIdFilter ? { authorId: authorIdFilter } : {}),
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
        author: { select: isPublic ? { name: true } : { name: true, email: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  if (isPublic) {
    return json({
      articles: articles.map((a) => toPublicArticle(a as unknown as Record<string, unknown>)),
      total,
      page,
      perPage,
    });
  }

  return json({ articles, total, page, perPage });
}

export async function POST(req: NextRequest) {
  const auth = await requireExactRoles(["AUTHOR", "EDITOR"]);
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

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

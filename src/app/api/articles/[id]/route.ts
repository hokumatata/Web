import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, forbidden, notFound } from "@/lib/api";
import { requireRole, getSession } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";

function toPublicArticle<T extends Record<string, unknown>>(article: T) {
  const { dueDiligence: _dd, ...rest } = article;
  if (rest.author && typeof rest.author === "object" && rest.author !== null) {
    const { email: _email, ...authorRest } = rest.author as Record<string, unknown>;
    return { ...rest, author: authorRest };
  }
  return rest;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      author: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!article) return notFound("Article");

  const session = await getSession();
  const isEditor = session ? roleAtLeast(session.role, "EDITOR") : false;
  const isOwnAuthor =
    !!session && roleAtLeast(session.role, "AUTHOR") && article.authorId === session.uid;

  if (article.status === "PUBLISHED") {
    // CMS staff get internals; public readers get a scrubbed payload.
    if (isEditor || isOwnAuthor) return json(article);
    return json(toPublicArticle(article as unknown as Record<string, unknown>));
  }

  // Unpublished: AUTHOR (own) or EDITOR+ (all)
  if (!session) return unauthorized();
  if (!isEditor && !isOwnAuthor) return forbidden();

  return json(article);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("AUTHOR");
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  // Authors can only edit their own articles; editors+ can edit any
  if (!roleAtLeast(auth.session.role, "EDITOR") && article.authorId !== auth.session.uid) {
    return error("You can only edit your own articles", 403);
  }

  const body = await req.json();
  const { title, excerpt, bodyText, categoryId, coverImageUrl, thumbnailUrl, isFeatured, isBreaking, status, tags } = body;

  let nextStatus: string | undefined;
  if (status !== undefined) {
    // Publishing is EDITOR+ via POST /api/articles/[id]/publish only.
    if (status === "PUBLISHED") {
      return error("Use the publish endpoint to publish articles", 403);
    }
    if (!roleAtLeast(auth.session.role, "EDITOR")) {
      return error("Only editors can change article status", 403);
    }
    if (status !== "DRAFT" && status !== "REVIEW") {
      return error("Invalid status", 400);
    }
    nextStatus = status;
  }

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(excerpt !== undefined ? { excerpt } : {}),
      ...(bodyText !== undefined ? { body: bodyText } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(isBreaking !== undefined ? { isBreaking } : {}),
      ...(nextStatus !== undefined ? { status: nextStatus } : {}),
    },
  });

  if (tags && Array.isArray(tags)) {
    await prisma.articleTag.deleteMany({ where: { articleId: params.id } });
    for (const tagId of tags) {
      await prisma.articleTag.create({ data: { articleId: params.id, tagId } }).catch(() => {});
    }
  }

  revalidateTag("articles");
  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  await prisma.article.delete({ where: { id: params.id } }).catch(() => {});
  revalidateTag("articles");
  return json({ ok: true });
}

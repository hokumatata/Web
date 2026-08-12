import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, forbidden, notFound } from "@/lib/api";
import { requireExactRoles, getSession } from "@/lib/auth";
import { canPublish, isAdmin, isAuthor, isEditor } from "@/lib/types";

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
  // Editorial desk (EDITOR) or Site ops (ADMIN) may inspect internals; authors only own.
  const staffReader = !!session && (isEditor(session.role) || isAdmin(session.role));
  const isOwnAuthor =
    !!session && isAuthor(session.role) && article.authorId === session.uid;

  if (article.status === "PUBLISHED") {
    // CMS staff / own author get internals; everyone else gets a scrubbed payload.
    if (staffReader || isOwnAuthor) return json(article);
    return json(toPublicArticle(article as unknown as Record<string, unknown>));
  }

  // Unpublished: AUTHOR (own) or EDITOR / ADMIN (staff)
  if (!session) return unauthorized();
  if (!staffReader && !isOwnAuthor) return forbidden();

  return json(article);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireExactRoles(["AUTHOR", "EDITOR"]);
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  // Authors can only edit their own articles; editors can edit any
  if (!isEditor(auth.session.role) && article.authorId !== auth.session.uid) {
    return error("You can only edit your own articles", 403);
  }

  const body = await req.json();
  const { title, excerpt, bodyText, categoryId, coverImageUrl, thumbnailUrl, isFeatured, isBreaking, status, tags } = body;

  let nextStatus: string | undefined;
  if (status !== undefined) {
    // Publishing is via POST /api/articles/[id]/publish only (EDITOR/AUTHOR, not ADMIN).
    if (status === "PUBLISHED") {
      return error("Use the publish endpoint to publish articles", 403);
    }
    // Exact EDITOR — ADMIN is ops-only and must not drive editorial status.
    if (!isEditor(auth.session.role)) {
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
  const session = await getSession();
  if (!session) return unauthorized();
  // Reject / delete is an editorial action — ADMIN must not use it.
  if (!canPublish(session.role)) return forbidden();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  if (!isEditor(session.role) && article.authorId !== session.uid) {
    return forbidden();
  }

  await prisma.article.delete({ where: { id: params.id } }).catch(() => {});
  revalidateTag("articles");
  return json({ ok: true });
}

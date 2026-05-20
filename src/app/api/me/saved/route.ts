import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromZodError, ok, unauthorized, notFound } from "@/lib/api";

const Body = z.object({ articleId: z.string().min(1) });

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  const items = await prisma.savedArticle.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        include: {
          category: { select: { slug: true, name: true } },
          author: { select: { name: true, authorProfile: { select: { slug: true } } } },
        },
      },
    },
  });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId } });
  if (!article) return notFound();
  await prisma.savedArticle.upsert({
    where: { userId_articleId: { userId: session.uid, articleId: parsed.data.articleId } },
    update: {},
    create: { userId: session.uid, articleId: parsed.data.articleId },
  });
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  await prisma.savedArticle
    .delete({
      where: { userId_articleId: { userId: session.uid, articleId: parsed.data.articleId } },
    })
    .catch(() => null);
  return ok({ ok: true });
}

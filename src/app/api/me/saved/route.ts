import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const saved = await prisma.savedArticle.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        include: {
          category: { select: { slug: true, name: true } },
          author: { select: { name: true } },
        },
      },
    },
  });

  return json(saved);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { articleId } = await req.json();
  if (!articleId) return error("articleId is required");

  await prisma.savedArticle.create({
    data: { userId: session.uid, articleId },
  }).catch(() => {});

  return json({ ok: true }, 201);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { articleId } = await req.json();
  if (!articleId) return error("articleId is required");

  await prisma.savedArticle.delete({
    where: { userId_articleId: { userId: session.uid, articleId } },
  }).catch(() => {});

  return json({ ok: true });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromZodError, ok, notFound, unauthorized } from "@/lib/api";

const Body = z.object({ body: z.string().min(4).max(1000) });

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound();
  const comments = await prisma.comment.findMany({
    where: { articleId: article.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  return ok({ comments });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);

  const c = await prisma.comment.create({
    data: {
      articleId: article.id,
      userId: session.uid,
      body: parsed.data.body,
      status: "PENDING",
    },
  });
  return ok({ id: c.id, status: c.status });
}

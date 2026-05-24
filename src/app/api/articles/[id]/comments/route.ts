import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { articleId: params.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  return json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await req.json();
  if (!body.body?.trim()) return error("Comment body is required");

  const comment = await prisma.comment.create({
    data: {
      articleId: params.id,
      userId: session.uid,
      body: body.body.trim(),
      status: "APPROVED",
    },
    include: { user: { select: { name: true } } },
  });

  return json(comment, 201);
}

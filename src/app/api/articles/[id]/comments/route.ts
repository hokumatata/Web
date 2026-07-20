import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";

const MAX_COMMENT_LENGTH = 5000;

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
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) return error("Comment body is required");
  if (text.length > MAX_COMMENT_LENGTH)
    return error(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`);

  const comment = await prisma.comment.create({
    data: {
      articleId: params.id,
      userId: session.uid,
      body: text,
      status: "PENDING",
    },
    include: { user: { select: { name: true } } },
  });

  return json(comment, 201);
}

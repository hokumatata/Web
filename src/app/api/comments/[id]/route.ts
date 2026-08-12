import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, unauthorized, forbidden } from "@/lib/api";
import { requireExactRoles } from "@/lib/auth";

/** Comment moderation: newsroom EDITOR or master ADMIN (spam nuke). */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireExactRoles(["EDITOR", "ADMIN"]);
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  const { status } = await req.json();
  if (!["APPROVED", "REJECTED", "SPAM"].includes(status)) {
    return json({ error: "Invalid status" }, 400);
  }

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { status },
  });

  return json(comment);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireExactRoles(["EDITOR", "ADMIN"]);
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  await prisma.comment.delete({ where: { id: params.id } }).catch(() => {});
  return json({ ok: true });
}

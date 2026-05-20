import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, forbidden, notFound } from "@/lib/api";
import { audit } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);
  const a = await prisma.article.findUnique({ where: { id: params.id } });
  if (!a) return notFound();
  const next = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      status: next,
      publishedAt: next === "PUBLISHED" && !a.publishedAt ? new Date() : a.publishedAt,
    },
  });
  await audit(gate.session.uid, "article.publish_toggle", params.id, { status: next });
  return ok(updated);
}

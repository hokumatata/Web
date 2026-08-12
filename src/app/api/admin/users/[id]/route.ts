import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized, notFound } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return notFound("User");

  // Staff roles are managed outside this route; only READER accounts are editable here.
  if (user.role !== "READER") {
    return error("This endpoint only updates READER accounts. Editorial roles are managed under Authors.", 400);
  }

  const body = await req.json();

  // Role field is no longer accepted — readers stay READER; no promote/demote via Users API.
  if (Object.prototype.hasOwnProperty.call(body, "role")) {
    return error(
      "Role changes are not allowed on this endpoint. Create editors and authors under Authors.",
      400
    );
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  if (params.id === auth.session.uid) return error("Cannot delete yourself");

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return notFound("User");
  if (user.role !== "READER") {
    return error("This endpoint only deletes READER accounts.", 400);
  }

  await prisma.user.delete({ where: { id: params.id } }).catch(() => {});
  return json({ ok: true });
}

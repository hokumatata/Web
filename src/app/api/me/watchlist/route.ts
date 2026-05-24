import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: session.uid },
    orderBy: { symbol: "asc" },
  });

  return json(watchlist);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { symbol, type } = await req.json();
  if (!symbol || !type) return error("symbol and type are required");

  const item = await prisma.watchlist.create({
    data: { userId: session.uid, symbol, type },
  }).catch(() => null);

  return json(item ?? { ok: true }, 201);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { symbol, type } = await req.json();
  if (!symbol || !type) return error("symbol and type are required");

  await prisma.watchlist.deleteMany({
    where: { userId: session.uid, symbol, type },
  });

  return json({ ok: true });
}

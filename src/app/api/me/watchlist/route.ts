import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromZodError, ok, unauthorized } from "@/lib/api";
import { TICKER_TYPES } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  const items = await prisma.watchlist.findMany({
    where: { userId: session.uid },
    orderBy: { symbol: "asc" },
  });
  return ok({ items });
}

const PostBody = z.object({
  symbol: z.string().min(1).max(20),
  type: z.enum(TICKER_TYPES),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const parsed = PostBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const symbol = parsed.data.symbol.toUpperCase();
  const item = await prisma.watchlist.upsert({
    where: {
      userId_symbol_type: { userId: session.uid, symbol, type: parsed.data.type },
    },
    update: {},
    create: { userId: session.uid, symbol, type: parsed.data.type },
  });
  return ok(item);
}

const DeleteBody = z.object({
  symbol: z.string().min(1).max(20),
  type: z.enum(TICKER_TYPES),
});

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const parsed = DeleteBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  await prisma.watchlist
    .delete({
      where: {
        userId_symbol_type: {
          userId: session.uid,
          symbol: parsed.data.symbol.toUpperCase(),
          type: parsed.data.type,
        },
      },
    })
    .catch(() => null);
  return ok({ ok: true });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fromZodError, ok, forbidden, badRequest } from "@/lib/api";
import { TICKER_TYPES } from "@/lib/types";
import { audit } from "@/lib/audit";

export async function GET() {
  const items = await prisma.tickerConfig.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

const Body = z.object({
  symbol: z.string().min(1).max(20),
  label: z.string().min(1).max(40),
  type: z.enum(TICKER_TYPES),
  order: z.coerce.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const gate = await requireRole("EDITOR");
  if (!gate.ok) return forbidden(gate.reason);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;
  if (
    await prisma.tickerConfig.findUnique({
      where: { symbol_type: { symbol: data.symbol.toUpperCase(), type: data.type } },
    })
  ) {
    return badRequest("ticker exists");
  }
  const t = await prisma.tickerConfig.create({
    data: { symbol: data.symbol.toUpperCase(), label: data.label, type: data.type, order: data.order },
  });
  await audit(gate.session.uid, "ticker.create", t.id, { symbol: t.symbol, type: t.type });
  return ok(t);
}

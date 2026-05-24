import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const auth = await requireRole("EDITOR");
  if (!auth.ok) return unauthorized();

  const tickers = await prisma.tickerConfig.findMany({ orderBy: { order: "asc" } });
  return json(tickers);
}

export async function POST(req: NextRequest) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return unauthorized();

  const { symbol, label, type } = await req.json();
  if (!symbol || !label || !type) return error("All fields required");

  const ticker = await prisma.tickerConfig.create({
    data: { symbol, label, type },
  });

  return json(ticker, 201);
}

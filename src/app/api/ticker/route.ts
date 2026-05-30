import { NextResponse } from "next/server";
import { getCryptoQuotes, getFxQuotes } from "@/lib/markets";

export const revalidate = 30;

export async function GET() {
  const [crypto, fx] = await Promise.all([getCryptoQuotes(), getFxQuotes()]);
  const items = [...crypto.slice(0, 8), ...fx.slice(0, 6)];

  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

import { NextResponse } from "next/server";
import { getCryptoSimplePrices, getFxQuotes } from "@/lib/markets";

export const dynamic = "force-dynamic";

export async function GET() {
  const [crypto, fx] = await Promise.all([getCryptoSimplePrices(), getFxQuotes()]);
  const items = [...crypto, ...fx.slice(0, 6)];

  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=90" },
  });
}

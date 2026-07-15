import { NextResponse } from "next/server";
import { getRibbonQuotes } from "@/lib/markets";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getRibbonQuotes();

  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45" },
  });
}

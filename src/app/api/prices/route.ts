import { NextResponse } from "next/server";
import { getMarketsTable } from "@/lib/markets";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getMarketsTable(50);
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

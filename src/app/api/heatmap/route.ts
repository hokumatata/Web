import { NextResponse } from "next/server";
import { getCryptoQuotes, getFxQuotes, getYahooQuotes, type MarketQuote } from "@/lib/markets";

export const dynamic = "force-dynamic";

const COMMODITIES = [
  { ySymbol: "GC=F", symbol: "XAU", label: "Gold", type: "COMMODITY" as const },
  { ySymbol: "SI=F", symbol: "XAG", label: "Silver", type: "COMMODITY" as const },
  { ySymbol: "CL=F", symbol: "WTI", label: "Crude Oil", type: "COMMODITY" as const },
  { ySymbol: "PL=F", symbol: "PL", label: "Platinum", type: "COMMODITY" as const },
  { ySymbol: "HG=F", symbol: "HG", label: "Copper", type: "COMMODITY" as const },
  { ySymbol: "NG=F", symbol: "NG", label: "Nat Gas", type: "COMMODITY" as const },
];

const INDICES = [
  { ySymbol: "^GSPC", symbol: "SPX", label: "S&P 500", type: "STOCK" as const },
  { ySymbol: "^IXIC", symbol: "IXIC", label: "Nasdaq", type: "STOCK" as const },
  { ySymbol: "^DJI", symbol: "DJI", label: "Dow Jones", type: "STOCK" as const },
  { ySymbol: "^FTSE", symbol: "FTSE", label: "FTSE 100", type: "STOCK" as const },
  { ySymbol: "^GDAXI", symbol: "DAX", label: "DAX", type: "STOCK" as const },
  { ySymbol: "^N225", symbol: "N225", label: "Nikkei 225", type: "STOCK" as const },
  { ySymbol: "^HSI", symbol: "HSI", label: "Hang Seng", type: "STOCK" as const },
];

export interface HeatmapPayload {
  crypto: MarketQuote[];
  forex: MarketQuote[];
  commodities: MarketQuote[];
  indices: MarketQuote[];
}

export async function GET() {
  const [crypto, forex, commodities, indices] = await Promise.all([
    getCryptoQuotes(),
    getFxQuotes(),
    getYahooQuotes(COMMODITIES, 60),
    getYahooQuotes(INDICES, 60),
  ]);

  const payload: HeatmapPayload = { crypto, forex, commodities, indices };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
  });
}

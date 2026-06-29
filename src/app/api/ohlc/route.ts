import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CG_KEY = process.env.COINGECKO_API_KEY ?? "";
const CG_BASE = "https://api.coingecko.com/api/v3";

function cgUrl(path: string): string {
  if (!CG_KEY) return `${CG_BASE}${path}`;
  const sep = path.includes("?") ? "&" : "?";
  return `${CG_BASE}${path}${sep}x_cg_demo_api_key=${CG_KEY}`;
}

interface OHLCBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const CRYPTO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
};

const YAHOO_MAP: Record<string, string> = {
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "USDJPY=X",
  GOLD: "GC=F",
  SILVER: "SI=F",
  OIL: "CL=F",
  DXY: "DX-Y.NYB",
  SPX: "^GSPC",
  IXIC: "^IXIC",
  DJI: "^DJI",
};

async function fetchCryptoOHLC(cgId: string): Promise<OHLCBar[]> {
  const url = cgUrl(`/coins/${cgId}/ohlc?vs_currency=usd&days=90`);
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = (await res.json()) as number[][];
  return data.map(([t, o, h, l, c]) => ({
    time: Math.floor(t / 1000),
    open: o,
    high: h,
    low: l,
    close: c,
  }));
}

async function fetchYahooOHLC(ySymbol: string): Promise<OHLCBar[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?range=6mo&interval=1d`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: {
          quote?: Array<{
            open?: (number | null)[];
            high?: (number | null)[];
            low?: (number | null)[];
            close?: (number | null)[];
          }>;
        };
      }>;
    };
  };
  const result = json.chart?.result?.[0];
  const ts = result?.timestamp ?? [];
  const q = result?.indicators?.quote?.[0];
  if (!q) return [];
  return ts
    .map((t, i) => ({
      time: t,
      open: q.open?.[i] ?? 0,
      high: q.high?.[i] ?? 0,
      low: q.low?.[i] ?? 0,
      close: q.close?.[i] ?? 0,
    }))
    .filter((b) => b.open > 0);
}

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") ?? "BTC").toUpperCase();

  let bars: OHLCBar[];
  const cryptoId = CRYPTO_MAP[symbol];
  if (cryptoId) {
    bars = await fetchCryptoOHLC(cryptoId);
  } else {
    const ySymbol = YAHOO_MAP[symbol];
    if (!ySymbol) return NextResponse.json({ error: "unknown symbol" }, { status: 400 });
    bars = await fetchYahooOHLC(ySymbol);
  }

  return NextResponse.json(bars, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}

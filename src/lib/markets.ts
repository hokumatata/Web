export interface MarketQuote {
  symbol: string;
  label: string;
  type: "CRYPTO" | "FX" | "STOCK" | "COMMODITY";
  price: number;
  changePct24h: number;
  currency?: string;
  imageUrl?: string;
}

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  image: string;
}

const CG_BASE = "https://api.coingecko.com/api/v3";
const CG_KEY = process.env.COINGECKO_API_KEY ?? "";

/** Build a CoinGecko URL, appending the demo API key when configured. */
function cgUrl(path: string): string {
  if (!CG_KEY) return `${CG_BASE}${path}`;
  const sep = path.includes("?") ? "&" : "?";
  return `${CG_BASE}${path}${sep}x_cg_demo_api_key=${CG_KEY}`;
}

const CRYPTO_IDS = [
  "bitcoin", "ethereum", "solana", "binancecoin", "ripple",
  "cardano", "dogecoin", "tron", "avalanche-2", "polkadot",
];

export async function getCryptoQuotes(): Promise<MarketQuote[]> {
  const url = cgUrl(`/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(",")}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`);
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = (await res.json()) as CoinGeckoCoin[];
    return data.map((c) => ({
      symbol: c.symbol.toUpperCase(),
      label: c.name,
      type: "CRYPTO" as const,
      price: c.current_price,
      changePct24h: c.price_change_percentage_24h ?? 0,
      currency: "USD",
      imageUrl: c.image,
    }));
  } catch {
    return FALLBACK_CRYPTO;
  }
}

/** Coins shown in the top marquee, fetched via the lightweight simple/price endpoint. */
const TICKER_COINS = [
  { id: "bitcoin", symbol: "BTC", label: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", label: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", label: "BNB" },
  { id: "ripple", symbol: "XRP", label: "XRP" },
  { id: "solana", symbol: "SOL", label: "Solana" },
];

interface SimplePriceEntry {
  usd: number;
  usd_24h_change?: number;
}
type SimplePriceResponse = Record<string, SimplePriceEntry>;

/**
 * Fetch live crypto prices for the ticker from CoinGecko's `simple/price`
 * endpoint, parsing the nested `{ bitcoin: { usd, usd_24h_change } }` payload.
 */
export async function getCryptoSimplePrices(): Promise<MarketQuote[]> {
  const ids = TICKER_COINS.map((c) => c.id).join(",");
  const url = cgUrl(`/simple/price?vs_currencies=usd&ids=${ids}&include_24hr_change=true`);
  try {
    const res = await fetch(url, { next: { revalidate: 45 } });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = (await res.json()) as SimplePriceResponse;
    const quotes = TICKER_COINS.flatMap((c) => {
      const entry = data[c.id];
      if (!entry || typeof entry.usd !== "number") return [];
      return [{
        symbol: c.symbol,
        label: c.label,
        type: "CRYPTO" as const,
        price: entry.usd,
        changePct24h: entry.usd_24h_change ?? 0,
        currency: "USD",
      }];
    });
    if (quotes.length === 0) throw new Error("simple/price empty");
    return quotes;
  } catch {
    return FALLBACK_CRYPTO.filter((c) => TICKER_COINS.some((t) => t.symbol === c.symbol));
  }
}

export interface MarketRow {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  sparkline: number[];
}

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  circulating_supply: number;
  sparkline_in_7d?: { price: number[] };
}

/** Detailed market table used by the /price page. */
export async function getMarketsTable(perPage = 50): Promise<MarketRow[]> {
  const url = cgUrl(`/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`);
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = (await res.json()) as CoinGeckoMarket[];
    return data.map((c) => ({
      id: c.id,
      rank: c.market_cap_rank,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      change1h: c.price_change_percentage_1h_in_currency ?? 0,
      change24h: c.price_change_percentage_24h_in_currency ?? 0,
      change7d: c.price_change_percentage_7d_in_currency ?? 0,
      marketCap: c.market_cap ?? 0,
      volume24h: c.total_volume ?? 0,
      high24h: c.high_24h ?? 0,
      low24h: c.low_24h ?? 0,
      circulatingSupply: c.circulating_supply ?? 0,
      sparkline: c.sparkline_in_7d?.price ?? [],
    }));
  } catch {
    return [];
  }
}

const FX_PAIRS = [
  { base: "EUR", quote: "USD", label: "EUR/USD" },
  { base: "GBP", quote: "USD", label: "GBP/USD" },
  { base: "USD", quote: "JPY", label: "USD/JPY" },
  { base: "AUD", quote: "USD", label: "AUD/USD" },
  { base: "USD", quote: "CAD", label: "USD/CAD" },
  { base: "USD", quote: "CHF", label: "USD/CHF" },
  { base: "NZD", quote: "USD", label: "NZD/USD" },
  { base: "USD", quote: "INR", label: "USD/INR" },
];

/** Live FX majors via Yahoo's public chart endpoint (intraday, no API key). */
export async function getFxQuotes(): Promise<MarketQuote[]> {
  const items: YahooSymbol[] = FX_PAIRS.map((p) => ({
    ySymbol: `${p.base}${p.quote}=X`,
    symbol: p.label.replace("/", ""),
    label: p.label,
    type: "FX" as const,
    currency: p.quote,
  }));
  const results = await Promise.all(items.map((i) => fetchYahooQuote(i, 30)));
  return items.map((item, idx) =>
    results[idx] ?? FALLBACK_FX.find((f) => f.symbol === item.symbol) ?? {
      symbol: item.symbol,
      label: item.label,
      type: "FX" as const,
      price: 0,
      changePct24h: 0,
      currency: item.currency,
    }
  );
}

/**
 * Yahoo Finance public chart endpoint — powers non-crypto, non-FX assets
 * (equity indices, the dollar index, and commodities) with no API key.
 * One lightweight request per symbol; change % is computed from the prior close.
 */
interface YahooSymbol {
  ySymbol: string;
  symbol: string;
  label: string;
  type: MarketQuote["type"];
  currency?: string;
}

export const YAHOO_RIBBON: YahooSymbol[] = [
  { ySymbol: "DX-Y.NYB", symbol: "DXY", label: "Dollar Index", type: "FX" },
  { ySymbol: "GC=F", symbol: "XAU", label: "Gold", type: "COMMODITY" },
  { ySymbol: "SI=F", symbol: "XAG", label: "Silver", type: "COMMODITY" },
  { ySymbol: "CL=F", symbol: "WTI", label: "Crude Oil", type: "COMMODITY" },
  { ySymbol: "^GSPC", symbol: "SPX", label: "S&P 500", type: "STOCK" },
  { ySymbol: "^IXIC", symbol: "IXIC", label: "Nasdaq", type: "STOCK" },
  { ySymbol: "^DJI", symbol: "DJI", label: "Dow Jones", type: "STOCK" },
];

interface YahooMeta {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  currency?: string;
}

async function fetchYahooQuote(item: YahooSymbol, revalidate: number): Promise<MarketQuote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.ySymbol)}?range=5d&interval=1d`,
      { next: { revalidate }, headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) throw new Error(`yahoo ${res.status}`);
    const json = (await res.json()) as { chart?: { result?: Array<{ meta?: YahooMeta }> } };
    const meta = json.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    const prev = meta?.chartPreviousClose ?? meta?.previousClose;
    if (typeof price !== "number") throw new Error("yahoo no price");
    const changePct24h = prev ? ((price - prev) / prev) * 100 : 0;
    return {
      symbol: item.symbol,
      label: item.label,
      type: item.type,
      price,
      changePct24h,
      currency: meta?.currency ?? item.currency ?? "USD",
    };
  } catch {
    return null;
  }
}

/** Fetch a set of Yahoo-backed quotes, falling back to static values per symbol. */
export async function getYahooQuotes(
  items: YahooSymbol[] = YAHOO_RIBBON,
  revalidate = 30
): Promise<MarketQuote[]> {
  const results = await Promise.all(items.map((i) => fetchYahooQuote(i, revalidate)));
  return items.map((item, idx) => results[idx] ?? FALLBACK_MACRO.find((m) => m.symbol === item.symbol) ?? {
    symbol: item.symbol,
    label: item.label,
    type: item.type,
    price: 0,
    changePct24h: 0,
    currency: item.currency ?? "USD",
  });
}

/**
 * Unified "Live Market Ribbon" feed in the exact order the newsroom wants:
 * crypto majors → dollar index → FX majors → metals → equity indices.
 */
export async function getRibbonQuotes(): Promise<MarketQuote[]> {
  const [crypto, fx, macro] = await Promise.all([
    getCryptoSimplePrices(),
    getFxQuotes(),
    getYahooQuotes(YAHOO_RIBBON, 30),
  ]);
  const find = (arr: MarketQuote[], sym: string) => arr.find((q) => q.symbol === sym);
  const macroBy = (sym: string) => find(macro, sym);
  const ordered: (MarketQuote | undefined)[] = [
    find(crypto, "BTC"),
    find(crypto, "ETH"),
    find(crypto, "SOL"),
    find(crypto, "XRP"),
    macroBy("DXY"),
    find(fx, "EURUSD"),
    find(fx, "GBPUSD"),
    find(fx, "USDJPY"),
    macroBy("XAU"),
    macroBy("XAG"),
    macroBy("SPX"),
    macroBy("IXIC"),
  ];
  return ordered.filter((q): q is MarketQuote => Boolean(q));
}

const FALLBACK_CRYPTO: MarketQuote[] = [
  { symbol: "BTC", label: "Bitcoin", type: "CRYPTO", price: 67800, changePct24h: 1.4, currency: "USD" },
  { symbol: "ETH", label: "Ethereum", type: "CRYPTO", price: 3540, changePct24h: 0.6, currency: "USD" },
  { symbol: "SOL", label: "Solana", type: "CRYPTO", price: 168, changePct24h: -1.1, currency: "USD" },
  { symbol: "BNB", label: "BNB", type: "CRYPTO", price: 612, changePct24h: 0.2, currency: "USD" },
  { symbol: "XRP", label: "XRP", type: "CRYPTO", price: 0.54, changePct24h: -0.4, currency: "USD" },
  { symbol: "ADA", label: "Cardano", type: "CRYPTO", price: 0.39, changePct24h: 0.9, currency: "USD" },
  { symbol: "DOGE", label: "Dogecoin", type: "CRYPTO", price: 0.12, changePct24h: 2.1, currency: "USD" },
  { symbol: "TRX", label: "TRON", type: "CRYPTO", price: 0.16, changePct24h: 0.3, currency: "USD" },
  { symbol: "AVAX", label: "Avalanche", type: "CRYPTO", price: 28.5, changePct24h: -0.8, currency: "USD" },
  { symbol: "DOT", label: "Polkadot", type: "CRYPTO", price: 6.1, changePct24h: 0.5, currency: "USD" },
];

const FALLBACK_MACRO: MarketQuote[] = [
  { symbol: "DXY", label: "Dollar Index", type: "FX", price: 104.2, changePct24h: 0.08, currency: "USD" },
  { symbol: "XAU", label: "Gold", type: "COMMODITY", price: 4042.2, changePct24h: 1.3, currency: "USD" },
  { symbol: "XAG", label: "Silver", type: "COMMODITY", price: 48.6, changePct24h: 0.9, currency: "USD" },
  { symbol: "WTI", label: "Crude Oil", type: "COMMODITY", price: 78.4, changePct24h: -0.6, currency: "USD" },
  { symbol: "SPX", label: "S&P 500", type: "STOCK", price: 7417.06, changePct24h: 0.4, currency: "USD" },
  { symbol: "IXIC", label: "Nasdaq", type: "STOCK", price: 24650, changePct24h: 0.6, currency: "USD" },
  { symbol: "DJI", label: "Dow Jones", type: "STOCK", price: 44210, changePct24h: 0.2, currency: "USD" },
];

const FALLBACK_FX: MarketQuote[] = [
  { symbol: "EURUSD", label: "EUR/USD", type: "FX", price: 1.0862, changePct24h: 0.12, currency: "USD" },
  { symbol: "GBPUSD", label: "GBP/USD", type: "FX", price: 1.2715, changePct24h: -0.08, currency: "USD" },
  { symbol: "USDJPY", label: "USD/JPY", type: "FX", price: 154.32, changePct24h: 0.21, currency: "JPY" },
  { symbol: "AUDUSD", label: "AUD/USD", type: "FX", price: 0.6534, changePct24h: -0.15, currency: "USD" },
  { symbol: "USDCAD", label: "USD/CAD", type: "FX", price: 1.3712, changePct24h: 0.05, currency: "CAD" },
  { symbol: "USDCHF", label: "USD/CHF", type: "FX", price: 0.8845, changePct24h: -0.03, currency: "CHF" },
  { symbol: "NZDUSD", label: "NZD/USD", type: "FX", price: 0.5967, changePct24h: 0.18, currency: "USD" },
  { symbol: "USDINR", label: "USD/INR", type: "FX", price: 83.45, changePct24h: 0.02, currency: "INR" },
];

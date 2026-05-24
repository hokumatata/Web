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

const CRYPTO_IDS = [
  "bitcoin", "ethereum", "solana", "binancecoin", "ripple",
  "cardano", "dogecoin", "tron", "avalanche-2", "polkadot",
];

export async function getCryptoQuotes(): Promise<MarketQuote[]> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(",")}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
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

interface FxResponse {
  rates: Record<string, number>;
  base: string;
}

export async function getFxQuotes(): Promise<MarketQuote[]> {
  try {
    const today = await fetch(
      `https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,JPY,AUD,CAD,CHF,NZD,INR`,
      { next: { revalidate: 120 } }
    );
    const yest = await fetch(
      `https://api.exchangerate.host/${yesterdayISO()}?base=USD&symbols=EUR,GBP,JPY,AUD,CAD,CHF,NZD,INR`,
      { next: { revalidate: 3600 } }
    );
    if (!today.ok || !yest.ok) throw new Error("fx fetch failed");
    const t = (await today.json()) as FxResponse;
    const y = (await yest.json()) as FxResponse;
    if (!t.rates || !y.rates) throw new Error("fx empty");
    return FX_PAIRS.map((p) => {
      const tRate = p.base === "USD" ? t.rates[p.quote] : 1 / t.rates[p.base];
      const yRate = p.base === "USD" ? y.rates[p.quote] : 1 / y.rates[p.base];
      const change = yRate ? ((tRate - yRate) / yRate) * 100 : 0;
      return {
        symbol: p.label.replace("/", ""),
        label: p.label,
        type: "FX" as const,
        price: tRate,
        changePct24h: change,
        currency: p.quote,
      };
    });
  } catch {
    return FALLBACK_FX;
  }
}

function yesterdayISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
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

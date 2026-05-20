import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCryptoQuotes, getFxQuotes, MarketQuote } from "@/lib/markets";
import { WatchlistManager } from "@/components/dashboard/WatchlistManager";

export const metadata = { title: "Watchlist" };
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const session = (await getSession())!;
  const [watch, crypto, fx] = await Promise.all([
    prisma.watchlist.findMany({
      where: { userId: session.uid },
      orderBy: { symbol: "asc" },
    }),
    getCryptoQuotes(),
    getFxQuotes(),
  ]);

  const quoteMap = new Map<string, MarketQuote>();
  for (const q of [...crypto, ...fx]) quoteMap.set(`${q.type}:${q.symbol}`, q);

  const items = watch.map((w) => ({
    id: w.id,
    symbol: w.symbol,
    type: w.type as "CRYPTO" | "FX" | "STOCK" | "COMMODITY",
    quote: quoteMap.get(`${w.type}:${w.symbol}`),
  }));

  const available = {
    CRYPTO: crypto.map((c) => ({ symbol: c.symbol, label: c.label })),
    FX: fx.map((c) => ({ symbol: c.symbol, label: c.label })),
  };

  return <WatchlistManager initial={items} available={available} />;
}

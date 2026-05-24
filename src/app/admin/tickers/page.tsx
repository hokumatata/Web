import { prisma } from "@/lib/db";
import { TickersManager } from "@/components/admin/TickersManager";

export const metadata = { title: "Manage Tickers" };

export default async function AdminTickersPage() {
  const tickers = await prisma.tickerConfig.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-ink-50 mb-6">Ticker Config</h2>
      <TickersManager tickers={tickers} />
    </div>
  );
}

import { prisma } from "@/lib/db";
import { TickersManager } from "@/components/admin/TickersManager";

export const metadata = { title: "Admin · Tickers" };
export const dynamic = "force-dynamic";

export default async function AdminTickersPage() {
  const items = await prisma.tickerConfig.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Markets</span>
          <h1 className="font-serif text-2xl">Ticker configuration</h1>
        </div>
      </div>
      <TickersManager
        items={items.map((t) => ({ id: t.id, symbol: t.symbol, label: t.label, type: t.type, order: t.order }))}
      />
    </div>
  );
}

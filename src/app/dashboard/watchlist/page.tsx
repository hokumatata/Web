import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WatchlistManager } from "@/components/dashboard/WatchlistManager";

export const metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const session = await getSession();
  if (!session) return null;

  const items = await prisma.watchlist.findMany({
    where: { userId: session.uid },
    orderBy: { symbol: "asc" },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Watchlist</h2>
      <WatchlistManager items={items} />
    </div>
  );
}

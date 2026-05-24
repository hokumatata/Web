import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Bookmark, Eye, Settings } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [savedCount, watchlistCount] = await Promise.all([
    prisma.savedArticle.count({ where: { userId: session.uid } }),
    prisma.watchlist.count({ where: { userId: session.uid } }),
  ]);

  const cards = [
    { label: "Saved Articles", value: savedCount, href: "/dashboard/saved", icon: Bookmark },
    { label: "Watchlist Items", value: watchlistCount, href: "/dashboard/watchlist", icon: Eye },
    { label: "Preferences", value: "Configure", href: "/dashboard/preferences", icon: Settings },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Your Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card-hover p-5 group">
            <c.icon size={20} className="text-accent mb-3" />
            <div className="data-label">{c.label}</div>
            <div className="text-lg font-semibold text-white">{c.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

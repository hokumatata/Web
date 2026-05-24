import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { User, Bookmark, Eye, Settings, FileText, Plus } from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof User; minRole?: "AUTHOR" | "EDITOR" | "ADMIN" };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: User },
  { href: "/dashboard/articles", label: "My Articles", icon: FileText, minRole: "AUTHOR" },
  { href: "/dashboard/articles/new", label: "Write Article", icon: Plus, minRole: "AUTHOR" },
  { href: "/dashboard/saved", label: "Saved Articles", icon: Bookmark },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Eye },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="container-tw py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-ink-700 flex items-center justify-center text-lg font-bold text-accent">
            {session.name[0]}
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-white">{session.name}</h1>
            <p className="text-2xs text-ink-400">{session.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-48 flex-shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {NAV.filter((n) => !n.minRole || roleAtLeast(session.role, n.minRole)).map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink-300 hover:text-white hover:bg-ink-800 rounded-sm transition-colors whitespace-nowrap"
                >
                  <n.icon size={14} />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

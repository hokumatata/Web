import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { canPublish, isEditor } from "@/lib/types";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { User, Bookmark, Eye, Settings, FileText, Plus, ClipboardCheck } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof User;
  /** Exact roles that see this item (preferred over rank for publishing paths). */
  roles?: Array<"AUTHOR" | "EDITOR">;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: User },
  { href: "/dashboard/articles", label: "My Articles", icon: FileText, roles: ["AUTHOR", "EDITOR"] },
  { href: "/dashboard/articles/new", label: "Write Article", icon: Plus, roles: ["AUTHOR", "EDITOR"] },
  { href: "/admin/articles/review", label: "Review Queue", icon: ClipboardCheck, roles: ["EDITOR"] },
  { href: "/dashboard/saved", label: "Saved Articles", icon: Bookmark },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Eye },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const nav = NAV.filter((n) => {
    if (!n.roles) return true;
    return n.roles.includes(session.role as "AUTHOR" | "EDITOR");
  });

  return (
    <div className="container-tw py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-ink-700 flex items-center justify-center text-lg font-bold text-accent">
            {session.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-50">{session.name}</h1>
            <p className="text-2xs text-ink-400">{session.email}</p>
            {(canPublish(session.role) || isEditor(session.role)) && (
              <p className="text-2xs text-ink-500 mt-0.5">
                Writing and publishing live here
                {isEditor(session.role) ? " — review queue is under your nav" : ""}.
              </p>
            )}
          </div>
        </div>
        <LogoutButton />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-48 flex-shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink-300 hover:text-ink-50 hover:bg-ink-800 rounded-sm transition-colors whitespace-nowrap"
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

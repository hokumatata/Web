import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canPublish, isAdmin, isAuthor, isEditor } from "@/lib/types";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  User,
  Bookmark,
  Eye,
  Settings,
  FileText,
  Plus,
  ClipboardCheck,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Layers,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof User;
  /** Exact roles that see this item. Omit for all authenticated users. */
  roles?: Array<"READER" | "AUTHOR" | "EDITOR" | "ADMIN">;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: User },
  { href: "/dashboard/articles", label: "My Articles", icon: FileText, roles: ["AUTHOR", "EDITOR"] },
  { href: "/dashboard/articles/new", label: "Write Article", icon: Plus, roles: ["AUTHOR", "EDITOR"] },
  { href: "/dashboard/review", label: "Review Queue", icon: ClipboardCheck, roles: ["EDITOR"] },
  { href: "/dashboard/desk", label: "Desk", icon: Layers, roles: ["EDITOR"] },
  { href: "/dashboard/compose", label: "AI Compose", icon: Sparkles, roles: ["AUTHOR", "EDITOR"] },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquare, roles: ["EDITOR"] },
  { href: "/dashboard/saved", label: "Saved Articles", icon: Bookmark },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Eye },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const showReviewCount = isEditor(session.role);
  const reviewCount = showReviewCount
    ? await prisma.article.count({ where: { status: "REVIEW" } })
    : 0;

  const nav = NAV.filter((n) => {
    if (!n.roles) return true;
    return n.roles.includes(session.role);
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
                {isEditor(session.role)
                  ? "Newsroom desk — review queue and compose live here."
                  : isAuthor(session.role)
                  ? "Write and submit your articles from here."
                  : null}
              </p>
            )}
            {isAdmin(session.role) && (
              <p className="text-2xs text-ink-500 mt-0.5">
                Site configuration lives under Site ops — not the editorial desk.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin(session.role) && (
            <Link href="/admin" className="btn-ghost text-xs h-8">
              <LayoutDashboard size={14} /> Site ops
            </Link>
          )}
          <LogoutButton />
        </div>
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
                  {n.href === "/dashboard/review" && reviewCount > 0 && (
                    <span className="ml-auto badge-down text-2xs px-1.5 py-0.5">{reviewCount}</span>
                  )}
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

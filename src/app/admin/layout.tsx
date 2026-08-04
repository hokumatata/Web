import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LayoutDashboard, FileText, Tags, MessageSquare, Users, Mail, Activity, Settings, UserPlus, ClipboardCheck } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/articles/review", label: "Review Queue", icon: ClipboardCheck },
  { href: "/admin/authors", label: "Authors", icon: UserPlus },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/tickers", label: "Tickers", icon: Activity },
  { href: "/admin/audit-log", label: "Audit Log", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "EDITOR")) redirect("/login");

  const reviewCount = await prisma.article.count({ where: { status: "REVIEW" } });

  return (
    <div className="container-tw py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={20} className="text-accent" />
          <h1 className="text-xl font-bold text-ink-50">Admin</h1>
          <span className="badge">{session.role}</span>
        </div>
        <LogoutButton />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-52 flex-shrink-0">
          <ul className="flex lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-300 hover:text-ink-50 hover:bg-ink-850 rounded-md transition-colors whitespace-nowrap"
                >
                  <n.icon size={14} className="text-ink-400" />
                  {n.label}
                  {n.href === "/admin/articles/review" && reviewCount > 0 && (
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

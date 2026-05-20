import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!roleAtLeast(session.role, "EDITOR")) redirect("/dashboard");

  const NAV: { href: string; label: string; adminOnly?: boolean }[] = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/articles", label: "Articles" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/tags", label: "Tags" },
    { href: "/admin/comments", label: "Comments" },
    { href: "/admin/newsletter", label: "Newsletter" },
    { href: "/admin/tickers", label: "Tickers" },
    { href: "/admin/users", label: "Users", adminOnly: true },
    { href: "/admin/audit-log", label: "Audit log", adminOnly: true },
  ];

  return (
    <div className="container-mp py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-2">
        <div className="card p-3 mb-3">
          <span className="kicker">Admin</span>
          <div className="mt-1 text-sm font-semibold text-white">{session.name}</div>
          <div className="text-2xs text-ink-300">{session.email}</div>
          <span className="mt-2 inline-block badge-accent">{session.role}</span>
        </div>
        <nav className="card overflow-hidden text-sm">
          {NAV.filter((n) => !n.adminOnly || session.role === "ADMIN").map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block border-b border-ink-700 px-3 py-2 text-ink-200 hover:bg-ink-800 hover:text-white last:border-b-0"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-3 flex items-center gap-2">
          <Link href="/" className="btn-secondary flex-1 justify-center text-xs">View site</Link>
          <LogoutButton />
        </div>
      </aside>
      <section className="lg:col-span-10 min-w-0">{children}</section>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const NAV = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/watchlist", label: "Watchlist" },
    { href: "/dashboard/saved", label: "Saved articles" },
    { href: "/dashboard/preferences", label: "Preferences" },
  ];

  return (
    <div className="container-mp py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3">
        <div className="card p-4">
          <span className="kicker">Signed in as</span>
          <div className="mt-1 text-sm font-semibold text-white">{session.name}</div>
          <div className="text-2xs text-ink-300">{session.email}</div>
          <div className="mt-2"><span className="badge">{session.role}</span></div>
        </div>
        <nav className="mt-4 card overflow-hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block border-b border-ink-700 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-800 hover:text-white last:border-b-0"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-2">
          {(session.role === "ADMIN" || session.role === "EDITOR") && (
            <Link href="/admin" className="btn-secondary flex-1 justify-center">
              Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </aside>
      <section className="lg:col-span-9">{children}</section>
    </div>
  );
}

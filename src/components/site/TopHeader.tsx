import Link from "next/link";
import { Search, User, LogIn } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LiveClock } from "./LiveClock";

const NAV = [
  { href: "/news", label: "News" },
  { href: "/category/crypto", label: "Crypto" },
  { href: "/category/forex", label: "Forex" },
  { href: "/category/stocks", label: "Stocks" },
  { href: "/category/macro", label: "Macro" },
  { href: "/category/analysis", label: "Analysis" },
  { href: "/category/opinion", label: "Opinion" },
  { href: "/markets", label: "Markets" },
];

export async function TopHeader({
  session,
  siteName,
}: {
  session: SessionPayload | null;
  siteName: string;
}) {
  const breakingCount = await prisma.article
    .count({ where: { status: "PUBLISHED", isBreaking: true } })
    .catch(() => 0);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/90 backdrop-blur supports-[backdrop-filter]:bg-ink-950/70">
      <div className="border-b border-ink-800/80">
        <div className="container-mp flex h-8 items-center justify-between text-2xs uppercase tracking-wider text-ink-300">
          <div className="flex items-center gap-4">
            <LiveClock />
            {breakingCount > 0 && (
              <Link
                href="/news?breaking=1"
                className="flex items-center gap-2 text-accent hover:underline"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Breaking · {breakingCount}
              </Link>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/newsletter" className="hover:text-white">Newsletter</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      <div className="container-mp flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="block h-7 w-1 bg-accent" />
          <span className="font-serif text-2xl font-bold tracking-tight text-white">
            {siteName}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-sm px-3 py-1.5 text-sm font-medium text-ink-200 hover:bg-ink-800 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form action="/search" className="hidden md:flex items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
              <input
                name="q"
                placeholder="Search markets, articles, tickers..."
                className="input pl-7 w-56 lg:w-72 text-sm h-8"
              />
            </div>
          </form>

          {session ? (
            <Link href="/dashboard" className="btn-secondary h-8 px-3">
              <User size={14} />
              <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn-secondary h-8 px-3">
              <LogIn size={14} />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}

          {session && (session.role === "ADMIN" || session.role === "EDITOR") && (
            <Link href="/admin" className="btn-primary h-8 px-3 text-xs">
              Admin
            </Link>
          )}
        </div>
      </div>

      <nav className="container-mp lg:hidden flex items-center gap-1 overflow-x-auto pb-2 scroll-shadow">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-ink-800 hover:text-white"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

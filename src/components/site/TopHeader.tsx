import Link from "next/link";
import { Search, User, LogIn, TrendingUp, Zap } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-ink-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-ink-950/80">
      {/* Bloomberg-style top utility bar */}
      <div className="border-b border-ink-800/60">
        <div className="container-tw flex h-8 items-center justify-between text-2xs uppercase tracking-wider text-ink-400">
          <div className="flex items-center gap-4">
            <LiveClock />
            <span className="hidden sm:inline text-ink-600">|</span>
            <span className="hidden sm:inline">New York</span>
            {breakingCount > 0 && (
              <>
                <span className="text-ink-600">|</span>
                <Link
                  href="/news?breaking=1"
                  className="flex items-center gap-1.5 text-accent hover:underline animate-pulse-dot"
                >
                  <Zap size={10} className="fill-accent" />
                  Breaking News
                </Link>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-ink-700">
        <div className="container-tw flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-0.5">
              <span className="block h-8 w-1.5 bg-accent rounded-sm" />
              <span className="block h-8 w-1.5 bg-accent/50 rounded-sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-white leading-none group-hover:text-accent transition-colors">
                {siteName}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-ink-400 leading-none mt-0.5">
                Markets &amp; Data
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="relative px-3 py-1.5 text-[13px] font-medium text-ink-200 hover:text-white transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <form action="/search" className="hidden md:flex items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" size={14} />
                <input
                  name="q"
                  placeholder="Search..."
                  className="input pl-8 w-48 lg:w-64 text-sm h-8 bg-ink-850 border-ink-700"
                />
              </div>
            </form>

            {session ? (
              <Link href="/dashboard" className="btn-secondary h-8 px-3">
                <User size={14} />
                <span className="hidden sm:inline text-xs">{session.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link href="/login" className="btn-secondary h-8 px-3">
                <LogIn size={14} />
                <span className="hidden sm:inline text-xs">Sign in</span>
              </Link>
            )}

            {session && (session.role === "ADMIN" || session.role === "EDITOR") && (
              <Link href="/admin" className="btn-primary h-8 px-3 text-xs">
                Admin
              </Link>
            )}

            <Link href="/markets" className="lg:hidden btn-ghost h-8 px-2">
              <TrendingUp size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="container-tw lg:hidden flex items-center gap-1 overflow-x-auto py-2 scroll-shadow border-b border-ink-800/50">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-sm px-3 py-1 text-xs font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

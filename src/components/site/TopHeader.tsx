import Link from "next/link";
import { Search, LogIn, TrendingUp, Zap } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LiveClock } from "./LiveClock";
import { UserMenu } from "./UserMenu";

const NAV = [
  { href: "/news", label: "NEWS" },
  { href: "/category/crypto", label: "CRYPTO" },
  { href: "/category/forex", label: "FOREX" },
  { href: "/category/stocks", label: "STOCKS" },
  { href: "/category/macro", label: "MACRO" },
  { href: "/category/analysis", label: "ANALYSIS" },
  { href: "/category/opinion", label: "OPINION" },
  { href: "/markets", label: "MARKETS" },
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
    <header className="sticky top-0 z-40 bg-ink-950">
      {/* Bloomberg-style top utility bar */}
      <div className="border-b border-ink-700">
        <div className="container-tw flex h-7 items-center justify-between text-3xs uppercase tracking-widest text-ink-400">
          <div className="flex items-center gap-3">
            <LiveClock />
            <span className="hidden sm:inline text-ink-600">|</span>
            <span className="hidden sm:inline">NYC</span>
            <span className="hidden sm:inline text-ink-600">|</span>
            <span className="hidden sm:inline">LDN</span>
            <span className="hidden sm:inline text-ink-600">|</span>
            <span className="hidden sm:inline">TKY</span>
            {breakingCount > 0 && (
              <>
                <span className="text-ink-600">|</span>
                <Link
                  href="/news?breaking=1"
                  className="flex items-center gap-1 text-down font-bold animate-pulse-dot"
                >
                  <Zap size={8} className="fill-down" />
                  BREAKING
                </Link>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/newsletter" className="hover:text-accent transition-colors">SUBSCRIBE</Link>
            <span className="text-ink-600">|</span>
            <Link href="/about" className="hover:text-accent transition-colors">ABOUT</Link>
            <span className="text-ink-600">|</span>
            <Link href="/contact" className="hover:text-accent transition-colors">CONTACT</Link>
          </div>
        </div>
      </div>

      {/* Main header — terminal style */}
      <div className="border-b border-ink-700 bg-ink-950">
        <div className="container-tw flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="block h-6 w-1 bg-accent" />
            <span className="text-lg font-bold tracking-tight text-accent leading-none uppercase">
              {siteName}
            </span>
            <span className="hidden sm:inline text-3xs uppercase tracking-[0.3em] text-ink-500 leading-none ml-1 border-l border-ink-600 pl-2">
              TERMINAL
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 text-2xs font-semibold text-ink-300 hover:text-accent hover:bg-ink-800 transition-colors tracking-wider"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <form action="/search" className="hidden md:flex items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-500" size={12} />
                <input
                  name="q"
                  placeholder="SEARCH..."
                  className="input pl-7 w-40 lg:w-56 text-2xs h-7 bg-ink-900 border-ink-600 placeholder:uppercase placeholder:tracking-wider"
                />
              </div>
            </form>

            {session ? (
              <UserMenu name={session.name} role={session.role} />
            ) : (
              <Link href="/login" className="btn-secondary h-7 px-2 text-3xs">
                <LogIn size={12} />
                <span className="hidden sm:inline">SIGN IN</span>
              </Link>
            )}

            <Link href="/markets" className="lg:hidden btn-ghost h-7 px-2">
              <TrendingUp size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="container-tw lg:hidden flex items-center gap-0 overflow-x-auto py-1 scroll-shadow border-b border-ink-700">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap px-3 py-1 text-3xs font-bold text-ink-400 hover:bg-ink-800 hover:text-accent transition-colors tracking-widest"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

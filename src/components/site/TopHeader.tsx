import Link from "next/link";
import { Search, LogIn, Zap } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LiveClock } from "./LiveClock";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";

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
    <header className="sticky top-0 z-40 bg-ink-950/95 backdrop-blur-md border-b border-ink-700">
      {/* Utility bar */}
      <div className="border-b border-ink-800">
        <div className="container-tw flex h-8 items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-ink-400">
            <LiveClock />
            <span className="hidden sm:inline text-ink-600">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-ink-500">
              <span className="h-1.5 w-1.5 rounded-full bg-up inline-block" />
              Markets Open
            </span>
            {breakingCount > 0 && (
              <>
                <span className="text-ink-600">|</span>
                <Link
                  href="/news?breaking=1"
                  className="flex items-center gap-1.5 text-down font-semibold animate-pulse-dot"
                >
                  <Zap size={10} className="fill-down" />
                  Breaking News
                </Link>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-ink-400">
            <Link href="/newsletter" className="hover:text-accent transition-colors font-medium">Subscribe</Link>
            <span className="text-ink-700">|</span>
            <Link href="/about" className="hover:text-accent transition-colors">About</Link>
            <span className="text-ink-700">|</span>
            <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-tw flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">TW</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-ink-50 leading-none">
                {siteName}
              </span>
              <span className="text-[10px] text-ink-400 font-medium tracking-wider leading-none mt-0.5">
                Financial Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 text-sm font-medium text-ink-300 hover:text-accent rounded-md hover:bg-ink-850 transition-all duration-150"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form action="/search" className="hidden md:flex items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={14} />
              <input
                name="q"
                placeholder="Search news, markets..."
                className="input pl-9 w-52 lg:w-64 text-sm h-9 bg-ink-900 border-ink-700"
              />
            </div>
          </form>

          <ThemeToggle />

          {session ? (
            <UserMenu name={session.name} role={session.role} />
          ) : (
            <Link href="/login" className="btn-primary h-9 px-4 text-sm">
              <LogIn size={14} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="container-tw lg:hidden flex items-center gap-1 overflow-x-auto py-2 scroll-shadow border-t border-ink-800">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap px-3 py-1 text-sm font-medium text-ink-400 hover:text-accent hover:bg-ink-850 rounded-md transition-colors"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

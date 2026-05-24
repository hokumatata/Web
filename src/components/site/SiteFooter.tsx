import Link from "next/link";

export function SiteFooter({ siteName }: { siteName: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-ink-700 bg-ink-900">
      <div className="container-tw grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">TW</span>
            </div>
            <span className="text-lg font-extrabold text-ink-50 tracking-tight">{siteName}</span>
          </div>
          <p className="max-w-sm text-sm text-ink-400 leading-relaxed">
            Professional-grade market intelligence. Live data, expert analysis, and breaking news across crypto, forex, equities, and macro.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-4">Sections</h4>
          <ul className="space-y-2.5">
            {[
              { href: "/news", label: "News" },
              { href: "/category/crypto", label: "Crypto" },
              { href: "/category/forex", label: "Forex" },
              { href: "/category/stocks", label: "Stocks" },
              { href: "/category/macro", label: "Macro" },
              { href: "/category/gold", label: "Gold" },
              { href: "/economic-calendar", label: "Economic Calendar" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-400 hover:text-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-300 mb-4">Company</h4>
          <ul className="space-y-2.5">
            {[
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/newsletter", label: "Newsletter" },
              { href: "/login", label: "Sign In" },
              { href: "/register", label: "Register" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-400 hover:text-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700">
        <div className="container-tw flex flex-col gap-2 py-5 text-xs text-ink-500 md:flex-row md:items-center md:justify-between">
          <span>&copy; {year} {siteName}. All rights reserved. Not financial advice.</span>
          <span>Built for traders &amp; analysts</span>
        </div>
      </div>
    </footer>
  );
}

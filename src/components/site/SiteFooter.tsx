import Link from "next/link";

export function SiteFooter({ siteName }: { siteName: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-ink-700 bg-ink-950">
      {/* Terminal data bar */}
      <div className="border-b border-ink-700">
        <div className="container-tw py-4 grid grid-cols-2 md:grid-cols-4 gap-px">
          <div className="text-center p-2">
            <div className="data-label">COVERAGE</div>
            <div className="text-2xs font-mono text-accent">24/7 LIVE</div>
          </div>
          <div className="text-center p-2">
            <div className="data-label">SECTIONS</div>
            <div className="text-2xs font-mono text-ink-100">6</div>
          </div>
          <div className="text-center p-2">
            <div className="data-label">DATA FEED</div>
            <div className="text-2xs font-mono text-up">REAL-TIME</div>
          </div>
          <div className="text-center p-2">
            <div className="data-label">REGIONS</div>
            <div className="text-2xs font-mono text-ink-100">GLOBAL</div>
          </div>
        </div>
      </div>

      <div className="container-tw grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="block h-4 w-1 bg-accent" />
            <span className="text-sm font-bold text-accent uppercase tracking-wider">{siteName}</span>
          </div>
          <p className="mt-3 max-w-md text-2xs text-ink-400 leading-relaxed uppercase tracking-wide">
            Professional-grade market intelligence. Live data, expert analysis, and breaking news across crypto, FX, equities, and macro.
          </p>
        </div>
        <div>
          <h4 className="data-label mb-3">SECTIONS</h4>
          <ul className="space-y-1.5 text-2xs">
            <li><Link href="/news" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">News</Link></li>
            <li><Link href="/category/crypto" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Crypto</Link></li>
            <li><Link href="/category/forex" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Forex</Link></li>
            <li><Link href="/category/stocks" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Stocks</Link></li>
            <li><Link href="/category/macro" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Macro</Link></li>
            <li><Link href="/markets" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Markets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="data-label mb-3">COMPANY</h4>
          <ul className="space-y-1.5 text-2xs">
            <li><Link href="/about" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">About</Link></li>
            <li><Link href="/contact" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Contact</Link></li>
            <li><Link href="/newsletter" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Newsletter</Link></li>
            <li><Link href="/login" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Sign In</Link></li>
            <li><Link href="/register" className="text-ink-300 hover:text-accent transition-colors uppercase tracking-wider">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700">
        <div className="container-tw flex flex-col gap-1 py-3 text-3xs text-ink-500 uppercase tracking-widest md:flex-row md:items-center md:justify-between">
          <span>&copy; {year} {siteName}. ALL RIGHTS RESERVED. NOT FINANCIAL ADVICE.</span>
          <span>BUILT FOR TRADERS &amp; ANALYSTS</span>
        </div>
      </div>
    </footer>
  );
}

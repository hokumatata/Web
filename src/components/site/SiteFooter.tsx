import Link from "next/link";
import { TrendingUp, Mail, Twitter, Github } from "lucide-react";

export function SiteFooter({ siteName }: { siteName: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-ink-700 bg-ink-900/30">
      {/* Bloomberg-style data bar */}
      <div className="border-b border-ink-800/50 bg-ink-950">
        <div className="container-tw py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="data-label">Live Markets</div>
            <div className="text-sm font-mono text-accent">24/7 Coverage</div>
          </div>
          <div className="text-center">
            <div className="data-label">Categories</div>
            <div className="text-sm font-mono text-ink-100">6 Sections</div>
          </div>
          <div className="text-center">
            <div className="data-label">Data Sources</div>
            <div className="text-sm font-mono text-ink-100">Real-time</div>
          </div>
          <div className="text-center">
            <div className="data-label">Regions</div>
            <div className="text-sm font-mono text-ink-100">Global</div>
          </div>
        </div>
      </div>

      <div className="container-tw grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <span className="block h-5 w-1 bg-accent rounded-sm" />
              <span className="block h-5 w-1 bg-accent/50 rounded-sm" />
            </div>
            <span className="font-serif text-xl font-bold text-white">{siteName}</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-ink-300 leading-relaxed">
            Professional-grade market intelligence. Live data, expert analysis, and breaking news across crypto, FX, equities, and macro.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="text-ink-400 hover:text-white transition-colors"><Twitter size={16} /></a>
            <a href="#" className="text-ink-400 hover:text-white transition-colors"><Github size={16} /></a>
            <a href="#" className="text-ink-400 hover:text-white transition-colors"><Mail size={16} /></a>
          </div>
        </div>
        <div>
          <h4 className="kicker mb-3">Sections</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/news" className="text-ink-300 hover:text-white transition-colors">News</Link></li>
            <li><Link href="/category/crypto" className="text-ink-300 hover:text-white transition-colors">Crypto</Link></li>
            <li><Link href="/category/forex" className="text-ink-300 hover:text-white transition-colors">Forex</Link></li>
            <li><Link href="/category/stocks" className="text-ink-300 hover:text-white transition-colors">Stocks</Link></li>
            <li><Link href="/category/macro" className="text-ink-300 hover:text-white transition-colors">Macro</Link></li>
            <li><Link href="/markets" className="text-ink-300 hover:text-white transition-colors">Live Markets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="kicker mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="text-ink-300 hover:text-white transition-colors">About</Link></li>
            <li><Link href="/contact" className="text-ink-300 hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/newsletter" className="text-ink-300 hover:text-white transition-colors">Newsletter</Link></li>
            <li><Link href="/login" className="text-ink-300 hover:text-white transition-colors">Sign in</Link></li>
            <li><Link href="/register" className="text-ink-300 hover:text-white transition-colors">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800/50">
        <div className="container-tw flex flex-col gap-2 py-4 text-2xs text-ink-400 md:flex-row md:items-center md:justify-between">
          <span>&copy; {year} {siteName}. All rights reserved. Not financial advice.</span>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-accent" />
            <span>Built for traders, analysts, and operators.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

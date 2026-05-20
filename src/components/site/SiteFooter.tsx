import Link from "next/link";

export function SiteFooter({ siteName }: { siteName: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-ink-700 bg-ink-900/40">
      <div className="container-mp grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="block h-5 w-1 bg-accent" />
            <span className="font-serif text-xl font-bold text-white">{siteName}</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-ink-300">
            Professional news, data and analysis for global markets — crypto, FX, stocks and macro.
            Not financial advice.
          </p>
        </div>
        <div>
          <h4 className="kicker mb-3">Sections</h4>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/news" className="text-ink-200 hover:text-white">News</Link></li>
            <li><Link href="/category/crypto" className="text-ink-200 hover:text-white">Crypto</Link></li>
            <li><Link href="/category/forex" className="text-ink-200 hover:text-white">Forex</Link></li>
            <li><Link href="/category/stocks" className="text-ink-200 hover:text-white">Stocks</Link></li>
            <li><Link href="/category/macro" className="text-ink-200 hover:text-white">Macro</Link></li>
            <li><Link href="/markets" className="text-ink-200 hover:text-white">Live markets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="kicker mb-3">Company</h4>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/about" className="text-ink-200 hover:text-white">About</Link></li>
            <li><Link href="/contact" className="text-ink-200 hover:text-white">Contact</Link></li>
            <li><Link href="/newsletter" className="text-ink-200 hover:text-white">Newsletter</Link></li>
            <li><Link href="/login" className="text-ink-200 hover:text-white">Sign in</Link></li>
            <li><Link href="/register" className="text-ink-200 hover:text-white">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700">
        <div className="container-mp flex flex-col gap-2 py-4 text-xs text-ink-300 md:flex-row md:items-center md:justify-between">
          <span>© {year} {siteName}. All rights reserved.</span>
          <span>Built for traders, researchers and operators.</span>
        </div>
      </div>
    </footer>
  );
}

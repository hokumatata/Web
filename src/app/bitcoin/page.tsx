import { prisma } from "@/lib/db";
import { TerminalPriceCard } from "@/components/terminal/TerminalPriceCard";
import { FaqSection } from "@/components/seo/FaqSection";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { timeAgo, readTime } from "@/lib/utils";
import type { Metadata } from "next";

const FAQS = [
  { question: "What is the current Bitcoin price?", answer: "The live BTC/USD price is shown at the top of this page, updated every 15 seconds from CoinGecko market data." },
  { question: "Where does this Bitcoin chart data come from?", answer: "The candlestick chart uses 90 days of daily OHLC data sourced from CoinGecko's public market API." },
  { question: "How often does the Bitcoin price update?", answer: "Spot prices refresh every 15 seconds, while the candlestick chart updates on a 5-minute cache cycle." },
];

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Bitcoin Terminal",
  description: "Live BTC/USD price, candlestick chart, key levels, and related crypto news.",
  alternates: { canonical: "/bitcoin" },
};

export default async function BitcoinPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: { slug: "crypto" } },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: { category: { select: { slug: true, name: true } }, author: { select: { name: true } } },
  });

  return (
    <div className="container-tw py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <TerminalPriceCard symbol="BTC" title="Bitcoin (BTC/USD)" />
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="card">
            <div className="border-b border-ink-700 bg-ink-900 px-4 py-3">
              <h3 className="text-sm font-bold text-ink-50">Related News</h3>
            </div>
            <div className="divide-y divide-ink-800">
              {articles.map((a) => (
                <Link key={a.slug} href={`/article/${a.slug}`} className="block px-4 py-3 hover:bg-ink-900/60 group">
                  <span className="text-sm font-medium text-ink-100 group-hover:text-accent line-clamp-2">{a.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-2xs text-ink-500">
                    {a.author && <span>{a.author.name}</span>}
                    <span className="flex items-center gap-0.5"><Clock size={10} /> {readTime(a.body)} min</span>
                    <span>{timeAgo(a.publishedAt)}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-t border-ink-700 px-4 py-2.5 text-right">
              <Link href="/category/crypto" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                All Crypto News <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <FaqSection faqs={FAQS} />
    </div>
  );
}

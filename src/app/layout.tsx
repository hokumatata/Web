import "./globals.css";
import type { Metadata } from "next";
import { TopHeader } from "@/components/site/TopHeader";
import { TickerTape } from "@/components/site/TickerTape";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSession } from "@/lib/auth";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "MarketPulse";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Markets, Crypto & Macro News`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Live markets, crypto and forex news, deep analysis, and macro coverage for professionals.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className="dark">
      <body>
        <TopHeader session={session} siteName={SITE_NAME} />
        <TickerTape />
        <main>{children}</main>
        <SiteFooter siteName={SITE_NAME} />
      </body>
    </html>
  );
}

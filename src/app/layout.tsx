import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { TopHeader } from "@/components/site/TopHeader";
import { TickerTape } from "@/components/site/TickerTape";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { getSession } from "@/lib/auth";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "The Forex Republic";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theforexrepublic.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Markets, Crypto & Financial News`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Live markets data, crypto and forex news, deep analysis, and macro coverage for traders and professionals.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tw-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <QueryProvider>
          <ThemeProvider>
            <TopHeader session={session} siteName={SITE_NAME} />
            <TickerTape />
            <BreakingTicker />
            <main className="min-h-screen">{children}</main>
            <SiteFooter siteName={SITE_NAME} />
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}

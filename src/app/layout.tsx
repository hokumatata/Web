import "./globals.css";
import type { Metadata } from "next";
import { TopHeader } from "@/components/site/TopHeader";
import { TickerTape } from "@/components/site/TickerTape";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "The Forex Republic — Live Crypto, Forex & Macro Newsroom",
  description:
    "Professional-grade market intelligence. Live data, expert analysis, and breaking news across crypto, forex, equities, and macro.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  verification: {
    google: "ML5P-syvoQql2IJqNl7lJ1oLLlg8ZiDJiBvSGgVY15o",
  },
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
      </body>
    </html>
  );
}

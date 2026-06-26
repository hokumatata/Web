import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedToolBar } from "@/components/FeaturedToolBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-ink-900">
        <Header />
        <main>{children}</main>
        <Footer />
        <FeaturedToolBar />
      </body>
    </html>
  );
}

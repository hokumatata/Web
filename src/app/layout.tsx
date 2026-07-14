import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saanjh — Indian Wedding Planning",
  description:
    "A thoughtful preparation dashboard for modern Indian wedding planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

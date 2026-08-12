import type { Metadata } from "next";
import { PolicyShell } from "@/components/site/PolicyShell";
import { loadLegalMarkdown } from "@/lib/legal-content";
import { markdownToHtml } from "@/lib/markdown";
import { absUrl, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${SITE_NAME} uses cookies and similar technologies.`,
  alternates: { canonical: absUrl("/cookies") },
  openGraph: {
    title: "Cookie Policy",
    description: `How ${SITE_NAME} uses cookies and similar technologies.`,
    url: absUrl("/cookies"),
  },
};

export default function CookiesPage() {
  const html = markdownToHtml(loadLegalMarkdown("cookies"));
  return <PolicyShell html={html} />;
}

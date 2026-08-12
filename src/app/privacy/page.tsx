import type { Metadata } from "next";
import { PolicyShell } from "@/components/site/PolicyShell";
import { loadLegalMarkdown } from "@/lib/legal-content";
import { markdownToHtml } from "@/lib/markdown";
import { absUrl, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects personal information.`,
  alternates: { canonical: absUrl("/privacy") },
  openGraph: {
    title: "Privacy Policy",
    description: `How ${SITE_NAME} collects, uses, and protects personal information.`,
    url: absUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  const html = markdownToHtml(loadLegalMarkdown("privacy"));
  return <PolicyShell html={html} />;
}

import type { Metadata } from "next";
import { PolicyShell } from "@/components/site/PolicyShell";
import { loadLegalMarkdown } from "@/lib/legal-content";
import { markdownToHtml } from "@/lib/markdown";
import { absUrl, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms governing use of ${SITE_NAME} websites and services.`,
  alternates: { canonical: absUrl("/terms") },
  openGraph: {
    title: "Terms of Use",
    description: `Terms governing use of ${SITE_NAME} websites and services.`,
    url: absUrl("/terms"),
  },
};

export default function TermsPage() {
  const html = markdownToHtml(loadLegalMarkdown("terms"));
  return <PolicyShell html={html} />;
}

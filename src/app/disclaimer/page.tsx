import type { Metadata } from "next";
import { PolicyShell } from "@/components/site/PolicyShell";
import { loadLegalMarkdown } from "@/lib/legal-content";
import { markdownToHtml } from "@/lib/markdown";
import { absUrl, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${SITE_NAME} content is for information only and is not financial advice.`,
  alternates: { canonical: absUrl("/disclaimer") },
  openGraph: {
    title: "Disclaimer",
    description: `${SITE_NAME} content is for information only and is not financial advice.`,
    url: absUrl("/disclaimer"),
  },
};

export default function DisclaimerPage() {
  const html = markdownToHtml(loadLegalMarkdown("disclaimer"));
  return <PolicyShell html={html} />;
}

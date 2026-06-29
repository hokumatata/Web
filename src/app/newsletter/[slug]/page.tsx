import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { BRIEF_NAME } from "@/lib/newsletter";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const issue = await prisma.newsletterIssue.findUnique({ where: { slug: params.slug } });
  if (!issue) return { title: "Not found" };
  return {
    title: issue.subject,
    description: issue.preview,
    alternates: { canonical: `/newsletter/${issue.slug}` },
  };
}

export default async function NewsletterIssuePage({ params }: { params: { slug: string } }) {
  const issue = await prisma.newsletterIssue.findUnique({ where: { slug: params.slug } });
  if (!issue || issue.status !== "SENT") notFound();

  return (
    <div className="container-tw py-10 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Link href="/newsletter" className="inline-flex items-center gap-1 text-2xs text-ink-400 hover:text-accent mb-6">
          <ArrowLeft size={11} /> Back to {BRIEF_NAME}
        </Link>
        <h1 className="text-2xl font-bold text-ink-50 mb-1">{issue.subject}</h1>
        {issue.sentAt && (
          <p className="text-xs text-ink-500 mb-6">
            {new Date(issue.sentAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
        <div className="card overflow-hidden">
          <iframe
            title={issue.subject}
            srcDoc={issue.bodyHtml}
            className="w-full"
            style={{ height: "80vh", border: "none", background: "#0b1120" }}
          />
        </div>
      </div>
    </div>
  );
}

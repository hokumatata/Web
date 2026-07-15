import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewsletterInline } from "@/components/site/NewsletterInline";
import { ArrowRight, Mail } from "lucide-react";
import { BRIEF_NAME } from "@/lib/newsletter";

export const metadata = {
  title: BRIEF_NAME,
  description: "The most important crypto, forex, equities, and macro stories — delivered every morning.",
  alternates: { canonical: "/newsletter" },
};
export const revalidate = 600;

export default async function NewsletterPage() {
  const issues = await prisma.newsletterIssue
    .findMany({
      where: { status: "SENT" },
      orderBy: { sentAt: "desc" },
      select: { slug: true, subject: true, preview: true, sentAt: true },
      take: 30,
    })
    .catch(() => []);

  return (
    <div className="container-tw py-12 animate-fade-in">
      <div className="max-w-xl mx-auto text-center">
        <span className="kicker">Newsletter</span>
        <h1 className="text-3xl font-bold tracking-tight text-ink-50 mt-2 mb-4">{BRIEF_NAME}</h1>
        <p className="text-ink-300 mb-8">
          The most important market-moving stories delivered to your inbox every morning. Crypto, forex, equities, and macro — all in one concise email.
        </p>
        <NewsletterInline />
      </div>

      <div className="max-w-2xl mx-auto mt-16">
        <div className="section-title">
          <h2>Archive</h2>
        </div>
        {issues.length === 0 ? (
          <div className="card p-8 text-center">
            <Mail size={20} className="mx-auto text-ink-500 mb-2" />
            <p className="text-sm text-ink-400">No past editions yet. The first Daily Macro Brief will appear here once it ships.</p>
          </div>
        ) : (
          <div className="card divide-y divide-ink-800">
            {issues.map((issue) => (
              <Link key={issue.slug} href={`/newsletter/${issue.slug}`} className="block px-5 py-4 hover:bg-ink-900/60 group">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-ink-100 group-hover:text-accent">{issue.subject}</div>
                    <div className="text-xs text-ink-400 mt-0.5 line-clamp-1">{issue.preview}</div>
                  </div>
                  <ArrowRight size={14} className="text-ink-500 group-hover:text-accent shrink-0" />
                </div>
                {issue.sentAt && (
                  <div className="text-2xs text-ink-500 mt-1">
                    {new Date(issue.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { FileText, Users, MessageSquare, Mail, Eye } from "lucide-react";

export const metadata = { title: "Site ops" };

export default async function AdminDashboard() {
  const [articles, published, users, comments, pending, subscribers, totalViews] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.newsletterSubscriber.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
    ]);

  const stats = [
    { label: "Total Users", value: users, icon: Users, color: "text-bloomberg-blue", sub: undefined as string | undefined },
    {
      label: "Comments",
      value: comments,
      sub: pending > 0 ? `${pending} pending` : undefined,
      icon: MessageSquare,
      color: "text-up",
    },
    { label: "Subscribers", value: subscribers, icon: Mail, color: "text-bloomberg-gold", sub: undefined as string | undefined },
    {
      label: "Published articles",
      value: published,
      sub: `${articles} total on site`,
      icon: FileText,
      color: "text-accent",
    },
    { label: "Total Views", value: totalViews._sum.views ?? 0, icon: Eye, color: "text-ink-100", sub: undefined as string | undefined },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-2">Site ops overview</h2>
      <p className="text-sm text-ink-400 mb-6">
        Admins manage authors, taxonomy, newsletter subscribers, and site systems.
        Publishing and the review queue are for editors and authors only — see{" "}
        <Link href="/dashboard" className="text-accent hover:underline">
          the dashboard
        </Link>{" "}
        for personal saved/watchlist tools.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="data-label">{s.label}</span>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="data-value">{s.value.toLocaleString()}</div>
            {s.sub && <p className="text-2xs text-ink-400 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

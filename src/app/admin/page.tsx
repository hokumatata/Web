import { prisma } from "@/lib/db";
import { FileText, Users, MessageSquare, Mail, Eye, TrendingUp } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const [articles, published, drafts, users, comments, pending, subscribers, totalViews] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
  ]);

  const stats = [
    { label: "Total Articles", value: articles, sub: `${published} published, ${drafts} drafts`, icon: FileText, color: "text-accent" },
    { label: "Total Users", value: users, icon: Users, color: "text-bloomberg-blue" },
    { label: "Comments", value: comments, sub: pending > 0 ? `${pending} pending` : undefined, icon: MessageSquare, color: "text-up" },
    { label: "Subscribers", value: subscribers, icon: Mail, color: "text-bloomberg-gold" },
    { label: "Total Views", value: totalViews._sum.views ?? 0, icon: Eye, color: "text-ink-100" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Overview</h2>
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

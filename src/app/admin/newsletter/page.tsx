import { prisma } from "@/lib/db";
import { NewsletterAdmin } from "@/components/admin/NewsletterAdmin";

export const metadata = { title: "Admin · Newsletter" };
export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const confirmed = subs.filter((s) => s.confirmedAt).length;
  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Audience</span>
          <h1 className="font-serif text-2xl">Newsletter</h1>
        </div>
        <span className="text-2xs uppercase tracking-wider text-ink-300">
          {subs.length} total · {confirmed} confirmed
        </span>
      </div>
      <NewsletterAdmin
        items={subs.map((s) => ({
          id: s.id,
          email: s.email,
          createdAt: s.createdAt.toISOString(),
          confirmed: !!s.confirmedAt,
        }))}
      />
    </div>
  );
}

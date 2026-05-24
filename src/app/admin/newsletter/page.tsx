import { prisma } from "@/lib/db";
import { NewsletterAdmin } from "@/components/admin/NewsletterAdmin";

export const metadata = { title: "Newsletter Subscribers" };

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Newsletter</h2>
      <NewsletterAdmin
        subscribers={subscribers.map((s) => ({
          id: s.id,
          email: s.email,
          createdAt: s.createdAt.toISOString(),
          confirmedAt: s.confirmedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}

import { prisma } from "@/lib/db";
import { AuthorsManager } from "@/components/admin/AuthorsManager";
import { UserPlus } from "lucide-react";

export const metadata = { title: "Manage Authors" };

export default async function AdminAuthorsPage() {
  const authors = await prisma.user.findMany({
    where: { role: { in: ["AUTHOR", "EDITOR", "ADMIN"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      authorProfile: {
        select: { slug: true, bio: true, twitter: true },
      },
      _count: { select: { articles: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus size={18} className="text-accent" />
        <h2 className="text-xl font-bold text-ink-50">Authors</h2>
      </div>
      <AuthorsManager
        authors={authors.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          role: a.role,
          createdAt: a.createdAt.toISOString(),
          articleCount: a._count.articles,
          profile: a.authorProfile
            ? {
                slug: a.authorProfile.slug,
                bio: a.authorProfile.bio,
                twitter: a.authorProfile.twitter,
              }
            : null,
        }))}
      />
    </div>
  );
}

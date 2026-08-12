import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArticleCard, type ArticleCardData } from "@/components/news/ArticleCard";
import { absUrl, SITE_NAME } from "@/lib/seo";

const INCLUDE = {
  category: { select: { slug: true, name: true } },
  author: { select: { name: true, authorProfile: { select: { slug: true } } } },
} as const;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await prisma.authorProfile.findUnique({
    where: { slug: params.slug },
    select: { bio: true, user: { select: { name: true } } },
  });
  if (!profile) return { title: "Not found" };
  const name = profile.user.name;
  const description = profile.bio?.trim() || `Articles by ${name} on ${SITE_NAME}.`;
  return {
    title: name,
    description,
    alternates: { canonical: absUrl(`/author/${params.slug}`) },
    openGraph: {
      title: name,
      description,
      url: absUrl(`/author/${params.slug}`),
    },
  };
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const profile = await prisma.authorProfile.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      bio: true,
      avatarUrl: true,
      twitter: true,
      user: { select: { id: true, name: true } },
    },
  });
  if (!profile) notFound();

  const articles = (await prisma.article.findMany({
    where: { status: "PUBLISHED", authorId: profile.user.id },
    orderBy: { publishedAt: "desc" },
    take: 48,
    include: INCLUDE,
  })) as ArticleCardData[];

  return (
    <div className="container-tw py-8 animate-fade-in">
      <header className="mb-8 max-w-3xl">
        <span className="kicker">Author</span>
        <div className="mt-2 flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-ink-700 flex items-center justify-center text-lg font-bold text-ink-200 flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              profile.user.name[0]
            )}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-50">
              {profile.user.name}
            </h1>
            {profile.bio && (
              <p className="mt-2 text-ink-200 leading-relaxed">{profile.bio}</p>
            )}
            {profile.twitter && (
              <p className="mt-2 text-sm text-ink-400">{profile.twitter}</p>
            )}
          </div>
        </div>
      </header>

      <div className="mb-4 text-sm text-ink-300">
        {articles.length} published {articles.length === 1 ? "article" : "articles"}
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <ArticleCard key={a.slug} a={a} />
          ))}
        </div>
      ) : (
        <p className="text-ink-400 py-12">No published articles yet.</p>
      )}
    </div>
  );
}

import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 60;

const getSitemapArticles = unstable_cache(
  () =>
    prisma.article
      .findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      })
      .catch(() => []),
  ["sitemap-articles"],
  { revalidate: 60, tags: ["articles"] }
);

// Exclude empty hubs until they have published articles.
const getSitemapCategories = unstable_cache(
  () =>
    prisma.category
      .findMany({
        where: { articles: { some: { status: "PUBLISHED" } } },
        select: { slug: true },
      })
      .catch(() => []),
  ["sitemap-categories"],
  { revalidate: 60, tags: ["articles"] }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "/",
    "/news",
    "/price",
    "/heatmap",
    "/economic-calendar",
    "/newsletter",
    "/bitcoin",
    "/forex",
    "/gold",
    "/macro",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/disclaimer",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const [articles, categories] = await Promise.all([
    getSitemapArticles(),
    getSitemapCategories(),
  ]);

  const articleRoutes = articles.map((a) => ({
    url: `${SITE_URL}/article/${a.slug}`,
    lastModified: a.updatedAt ?? a.publishedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}

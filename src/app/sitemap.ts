import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

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
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const [articles, categories] = await Promise.all([
    prisma.article
      .findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      })
      .catch(() => []),
    prisma.category.findMany({ select: { slug: true } }).catch(() => []),
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

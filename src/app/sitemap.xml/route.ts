import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
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
] as const;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(path: string, lastModified: Date, changeFrequency: string, priority: number): string {
  return `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
    prisma.category.findMany({
      where: { articles: { some: { status: "PUBLISHED" } } },
      select: { slug: true },
    }),
  ]);

  const now = new Date();
  const entries = [
    ...STATIC_PATHS.map((path) => urlEntry(path, now, "daily", path === "/" ? 1 : 0.7)),
    ...categories.map((c) => urlEntry(`/category/${c.slug}`, now, "daily", 0.6)),
    ...articles.map((a) =>
      urlEntry(`/article/${a.slug}`, a.updatedAt ?? a.publishedAt ?? now, "weekly", 0.8)
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}

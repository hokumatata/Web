import { prisma } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 600;
export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Google News sitemap: only articles published in the last 48 hours.
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const articles = await prisma.article
    .findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: since } },
      select: { slug: true, title: true, publishedAt: true, category: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    })
    .catch(() => []);

  const entries = articles
    .map(
      (a) => `  <url>
    <loc>${SITE_URL}/article/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${(a.publishedAt ?? new Date()).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}

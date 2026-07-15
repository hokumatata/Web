import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { revalidateTag } from "next/cache";

/**
 * Simple article publishing endpoint.
 * Secured by PUBLISH_API_KEY env var (no login required).
 *
 * POST /api/publish
 * Headers: { "x-api-key": "<PUBLISH_API_KEY>" }
 * Body (JSON):
 *   title       (required) — article headline
 *   excerpt     (required) — 1-2 sentence summary
 *   body        (required) — full article in markdown
 *   category    (required) — category slug: crypto, forex, stocks, macro, gold, analysis, opinion
 *   tags        (optional) — array of tag slugs
 *   coverImage  (optional) — cover image URL
 *   isFeatured  (optional) — boolean, default false
 *   isBreaking  (optional) — boolean, default false
 *   status      (optional) — PUBLISHED or DRAFT, default PUBLISHED
 *   authorEmail (optional) — defaults to admin@theforexrepublic.com
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.PUBLISH_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return error("Unauthorized — set PUBLISH_API_KEY env var and pass it as x-api-key header", 401);
  }

  const body = await req.json();
  const {
    title,
    excerpt,
    body: articleBody,
    category,
    tags,
    coverImage,
    isFeatured,
    isBreaking,
    status,
    authorEmail,
  } = body as {
    title?: string;
    excerpt?: string;
    body?: string;
    category?: string;
    tags?: string[];
    coverImage?: string;
    isFeatured?: boolean;
    isBreaking?: boolean;
    status?: string;
    authorEmail?: string;
  };

  if (!title || !excerpt || !articleBody || !category) {
    return error("Missing required fields: title, excerpt, body, category");
  }

  const cat = await prisma.category.findUnique({ where: { slug: category } });
  if (!cat) {
    return error(`Category "${category}" not found. Use: crypto, forex, stocks, macro, gold, analysis, opinion`);
  }

  const email = authorEmail ?? "admin@theforexrepublic.com";
  const author = await prisma.user.findUnique({ where: { email } });
  if (!author) {
    return error(`Author with email "${email}" not found`);
  }

  const slug = slugify(title) + "-" + Date.now().toString(36);
  const publishStatus = status === "DRAFT" ? "DRAFT" : "PUBLISHED";

  const article = await prisma.article.create({
    data: {
      slug,
      title,
      excerpt,
      body: articleBody,
      coverImageUrl: coverImage ?? "",
      categoryId: cat.id,
      authorId: author.id,
      isFeatured: isFeatured ?? false,
      isBreaking: isBreaking ?? false,
      status: publishStatus,
      publishedAt: publishStatus === "PUBLISHED" ? new Date() : null,
    },
  });

  if (tags && Array.isArray(tags)) {
    for (const tagSlug of tags) {
      const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (tag) {
        await prisma.articleTag.create({
          data: { articleId: article.id, tagId: tag.id },
        }).catch(() => {});
      }
    }
  }

  revalidateTag("articles");

  return json({
    success: true,
    article: {
      id: article.id,
      slug: article.slug,
      title: article.title,
      status: article.status,
      url: `/article/${article.slug}`,
    },
  }, 201);
}

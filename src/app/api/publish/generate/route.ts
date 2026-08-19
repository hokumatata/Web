import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { generateArticleDraft, type ArticleSources } from "@/lib/ai";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

/**
 * Generate + publish an article from raw sources in a single call.
 * Secured by PUBLISH_API_KEY env var (no login required), matching /api/publish.
 *
 * POST /api/publish/generate
 * Headers: { "x-api-key": "<PUBLISH_API_KEY>" }
 * Body (JSON):
 *   sources     (required) — { tweets, releases, chartNotes, referenceText, referenceUrls, keyIdeas, categoryHint }
 *   category    (optional) — override the AI-suggested category slug
 *   coverImage  (optional) — cover image URL
 *   thumbnail   (optional) — card thumbnail URL (falls back to cover on cards)
 *   isFeatured  (optional) — boolean, default false
 *   isBreaking  (optional) — boolean, default false
 *   status      (optional) — PUBLISHED or DRAFT, default DRAFT (AI drafts default to review)
 *   authorEmail (optional) — defaults to masteruser@theforexrepublic.com
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.PUBLISH_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return error("Unauthorized — set PUBLISH_API_KEY env var and pass it as x-api-key header", 401);
  }

  const payload = (await req.json().catch(() => null)) as {
    sources?: ArticleSources;
    category?: string;
    coverImage?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    isBreaking?: boolean;
    status?: string;
    authorEmail?: string;
  } | null;

  if (!payload) return error("Invalid JSON body");

  const sources = payload.sources ?? (payload as ArticleSources);
  const hasContent = [
    sources.tweets,
    sources.releases,
    sources.chartNotes,
    sources.referenceText,
    sources.referenceUrls,
    sources.keyIdeas,
  ].some((v) => typeof v === "string" && v.trim().length > 0);

  if (!hasContent) {
    return error("Provide at least one source in `sources` (tweets, releases, chartNotes, referenceText, referenceUrls, keyIdeas)");
  }

  let draft;
  try {
    draft = await generateArticleDraft(sources);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate draft";
    if (message.includes("OPENAI_API_KEY")) {
      return error("OpenAI is not configured. Set OPENAI_API_KEY.", 500);
    }
    return error(`Article generation failed: ${message}`, 502);
  }

  const categorySlug = payload.category ?? draft.categorySlug;
  const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!cat) {
    return error(`Category "${categorySlug}" not found. Use: crypto, forex, stocks, macro, gold, analysis, opinion`);
  }

  const email = payload.authorEmail ?? "masteruser@theforexrepublic.com";
  const author = await prisma.user.findUnique({ where: { email } });
  if (!author) {
    return error(`Author with email "${email}" not found`);
  }

  const slug = slugify(draft.title) + "-" + Date.now().toString(36);
  const publishStatus = payload.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const article = await prisma.article.create({
    data: {
      slug,
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body,
      coverImageUrl: payload.coverImage ?? "",
      thumbnailUrl: payload.thumbnail ?? null,
      categoryId: cat.id,
      authorId: author.id,
      isFeatured: payload.isFeatured ?? false,
      isBreaking: payload.isBreaking ?? false,
      status: publishStatus,
      publishedAt: publishStatus === "PUBLISHED" ? new Date() : null,
    },
  });

  for (const tagName of draft.tags) {
    const tag = await prisma.tag.findUnique({ where: { slug: slugify(tagName) } });
    if (tag) {
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId: tag.id },
      }).catch(() => {});
    }
  }

  revalidateTag("articles");
  revalidatePath("/sitemap.xml");
  revalidatePath("/news-sitemap.xml");

  return json({
    success: true,
    draft: {
      categorySlug: draft.categorySlug,
      suggestedTags: draft.tags,
    },
    article: {
      id: article.id,
      slug: article.slug,
      title: article.title,
      status: article.status,
      url: `/article/${article.slug}`,
    },
  }, 201);
}

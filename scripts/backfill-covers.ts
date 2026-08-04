/**
 * Backfill AI cover images for articles that don't have one.
 *
 * For every article with an empty/missing coverImageUrl, this generates a
 * house-style cover with OpenAI, uploads it to Vercel Blob, and saves the URL.
 *
 * Requires env: DATABASE_URL, OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN.
 * Optional env:
 *   BACKFILL_LIMIT   max number of articles to process (default: all)
 *   BACKFILL_STATUS  only this status (e.g. PUBLISHED). Default: all statuses.
 *
 * Run: npx tsx scripts/backfill-covers.ts
 */
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { generateArticleImage, buildImagePrompt } from "../src/lib/ai";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required");

  const limit = process.env.BACKFILL_LIMIT ? Number(process.env.BACKFILL_LIMIT) : undefined;
  const status = process.env.BACKFILL_STATUS;

  const articles = await prisma.article.findMany({
    where: {
      OR: [{ coverImageUrl: null }, { coverImageUrl: "" }],
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
    include: { category: { select: { slug: true } } },
  });

  console.log(`Found ${articles.length} article(s) needing a cover.\n`);

  let done = 0;
  let failed = 0;
  for (const a of articles) {
    try {
      const prompt = buildImagePrompt({
        title: a.title,
        excerpt: a.excerpt,
        categorySlug: a.category.slug,
        kind: "cover",
      });
      const image = await generateArticleImage(prompt);
      const blob = await put(`ai-images/${Date.now()}-${randomUUID()}.png`, image.buffer, {
        access: "public",
        contentType: image.contentType,
      });
      await prisma.article.update({
        where: { id: a.id },
        data: { coverImageUrl: blob.url },
      });
      done++;
      console.log(`✓ [${done}/${articles.length}] ${a.title.slice(0, 60)}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${a.title.slice(0, 60)}: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\nDone. ${done} updated, ${failed} failed.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

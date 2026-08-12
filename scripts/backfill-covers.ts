/**
 * DEPRECATED / REMOVED — AI cover image generation has been removed from the
 * product. Manual cover uploads via the article editor (ImageUpload →
 * /api/upload → Vercel Blob) remain supported.
 *
 * This script is kept only so historical docs/commands do not break the repo
 * layout; it exits immediately without calling OpenAI or Blob.
 *
 * Run: npx tsx scripts/backfill-covers.ts
 */

console.error(
  [
    "scripts/backfill-covers.ts: removed.",
    "AI cover image generation is no longer part of The Forex Republic.",
    "Upload covers manually in the article editor instead.",
  ].join("\n")
);
process.exit(1);

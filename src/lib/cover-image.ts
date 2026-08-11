/**
 * Cover-image generation and storage.
 *
 * Split out of the routes because image generation has two callers with
 * different failure needs: the editor's "Generate cover" button, where the
 * person clicking it must be told exactly what went wrong, and the scheduled
 * agent, where an image failure must never cost us the article.
 *
 * The storage half is where this actually breaks in practice. Generation calls
 * OpenAI and either works or returns a clear API error; the upload calls Vercel
 * Blob, which fails with a flat "Access denied" whenever the token is missing,
 * wrong, or belongs to a store that is not connected to the project. That error
 * reaching a user as "Network error" is why the check below is explicit.
 */

import { put } from "@vercel/blob";
import { buildImagePrompt, generateArticleImage } from "@/lib/ai";

/** Vercel Blob read-write tokens all carry this prefix. */
const BLOB_TOKEN_PREFIX = "vercel_blob_rw_";

/**
 * Why image storage cannot work right now, or null when the token looks usable.
 *
 * Checked before spending a cent on generation: an unusable token means the
 * image would be produced and then thrown away.
 */
export function blobStorageProblem(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return "Image storage is not configured: BLOB_READ_WRITE_TOKEN is not set. Add it in Vercel → Storage → your Blob store → Connect, then redeploy.";
  }
  if (!token.startsWith(BLOB_TOKEN_PREFIX)) {
    return `Image storage is misconfigured: BLOB_READ_WRITE_TOKEN is not a Vercel Blob token (it must start with "${BLOB_TOKEN_PREFIX}"). Copy the real value from Vercel → Storage → your Blob store → Connect, then redeploy.`;
  }
  return null;
}

/** Store image bytes and return the public URL. Throws with a legible message. */
export async function storeImage(buffer: Buffer, contentType: string): Promise<string> {
  const problem = blobStorageProblem();
  if (problem) throw new Error(problem);

  const name = `${Date.now()}-${crypto.randomUUID()}.png`;
  try {
    const blob = await put(`ai-images/${name}`, buffer, { access: "public", contentType });
    return blob.url;
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    if (/access denied|forbidden|unauthorized/i.test(detail)) {
      throw new Error(
        `Vercel Blob rejected the upload (${detail}). The BLOB_READ_WRITE_TOKEN is valid in shape but not accepted for this store — check the Blob store is connected to this project and the token has not been rotated.`
      );
    }
    throw new Error(`Image upload failed: ${detail}`);
  }
}

/** Generate an image from a prompt and store it, returning the public URL. */
export async function generateAndStoreImage(prompt: string): Promise<string> {
  // Fail before the paid call when we already know storage will refuse it.
  const problem = blobStorageProblem();
  if (problem) throw new Error(problem);

  const image = await generateArticleImage(prompt);
  return storeImage(image.buffer, image.contentType);
}

/**
 * Best-effort cover for an automated draft. Returns "" on any failure, and on
 * any failure logs the reason — an article without a cover is a small problem,
 * an article that never gets filed because its cover failed is a large one.
 */
export async function generateCoverBestEffort(
  title: string,
  excerpt: string,
  categorySlug: string,
  context: string
): Promise<string> {
  if (process.env.SOURCE_GENERATE_IMAGES === "false") return "";
  try {
    return await generateAndStoreImage(
      buildImagePrompt({ title, excerpt, categorySlug, kind: "cover" })
    );
  } catch (e) {
    console.error(`[${context}] cover image failed:`, e instanceof Error ? e.message : e);
    return "";
  }
}

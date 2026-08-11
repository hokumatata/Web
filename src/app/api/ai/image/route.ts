import { NextRequest } from "next/server";
import { json, error, unauthorized, forbidden } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { buildImagePrompt } from "@/lib/ai";
import { blobStorageProblem, generateAndStoreImage } from "@/lib/cover-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Image generation can take well over the 10s default; give it room (Vercel
// caps this to the project's plan limit — up to 60s on Hobby, 300s on Pro).
export const maxDuration = 300;

/**
 * POST /api/ai/image
 *
 * Opt-in AI image generation for article cover/thumbnail. AUTHOR+ only.
 * Generates a single image with the cheapest configured OpenAI image model,
 * stores it in Vercel Blob, and returns its public URL.
 *
 * Body (JSON):
 *   prompt       (optional) — explicit prompt; if omitted it is built from the fields below
 *   title        (optional) — article title, used to build the prompt
 *   excerpt      (optional) — article excerpt, used to build the prompt
 *   categorySlug (optional) — category slug, used to build the prompt
 *   kind         (optional) — "cover" | "thumbnail" (default "cover")
 *
 * Returns: { url }
 */
export async function POST(req: NextRequest) {
  const auth = await requireRole("AUTHOR");
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  let body: {
    prompt?: string;
    title?: string;
    excerpt?: string;
    categorySlug?: string;
    kind?: "cover" | "thumbnail";
  };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const prompt =
    body.prompt?.trim() ||
    (body.title?.trim()
      ? buildImagePrompt({
          title: body.title,
          excerpt: body.excerpt,
          categorySlug: body.categorySlug,
          kind: body.kind,
        })
      : "");

  if (!prompt) {
    return error("Provide a prompt or a title to generate an image from");
  }

  // Configuration problems are the common case here and are the caller's to
  // fix, so they come back as 4xx with the fix in the message rather than as an
  // opaque 500 the editor reads as "Network error".
  const storageProblem = blobStorageProblem();
  if (storageProblem) return error(storageProblem, 503);

  let url: string;
  try {
    url = await generateAndStoreImage(prompt);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate image";
    if (message.includes("OPENAI_API_KEY")) {
      return error("OpenAI is not configured. Set OPENAI_API_KEY.", 500);
    }
    // Storage messages already explain themselves; don't bury them in a prefix.
    if (/blob|storage|upload/i.test(message)) return error(message, 502);
    return error(`Image generation failed: ${message}`, 502);
  }

  return json({ url }, 201);
}

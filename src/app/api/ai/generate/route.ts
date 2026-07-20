import { NextRequest } from "next/server";
import { json, error, unauthorized, forbidden } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { generateArticleDraft, type ArticleSources } from "@/lib/ai";

export const runtime = "nodejs";

/**
 * POST /api/ai/generate
 *
 * Admin/editor endpoint that turns raw sources into a structured article
 * draft. Protected with the same role gate as the article endpoints (AUTHOR+).
 *
 * Body (JSON, all fields optional strings):
 *   { tweets, releases, chartNotes, referenceText, referenceUrls, keyIdeas, categoryHint }
 *
 * Returns: { title, excerpt, body, categorySlug, tags[] }
 */
export async function POST(req: NextRequest) {
  const auth = await requireRole("AUTHOR");
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  let body: ArticleSources;
  try {
    body = (await req.json()) as ArticleSources;
  } catch {
    return error("Invalid JSON body");
  }

  const hasContent = [
    body.tweets,
    body.releases,
    body.chartNotes,
    body.referenceText,
    body.referenceUrls,
    body.keyIdeas,
  ].some((v) => typeof v === "string" && v.trim().length > 0);

  if (!hasContent) {
    return error("Provide at least one source (tweets, releases, chart notes, reference text/URLs, or key ideas)");
  }

  try {
    const draft = await generateArticleDraft(body);
    return json(draft);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate draft";
    if (message.includes("OPENAI_API_KEY")) {
      return error("OpenAI is not configured. Set OPENAI_API_KEY.", 500);
    }
    return error(`Article generation failed: ${message}`, 502);
  }
}

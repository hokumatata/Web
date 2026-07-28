import OpenAI from "openai";
import { z } from "zod";

/**
 * OpenAI-backed article drafting for The Forex Republic.
 *
 * Takes raw editorial sources (tweet text, official releases, chart notes,
 * reference article text/URLs, and key ideas) and produces a structured,
 * house-style article draft ready to prefill the CMS form.
 *
 * NOTE: Live chart URLs (e.g. TradingView) cannot be fetched or "read" by the
 * model. Provide chart context as a textual description in `chartNotes`, or
 * upload a chart image separately via /api/upload and reference it in the body.
 */

export const CATEGORY_SLUGS = [
  "crypto",
  "forex",
  "stocks",
  "macro",
  "gold",
  "analysis",
  "opinion",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface ArticleSources {
  /** Raw tweet / social post text (X, Threads, etc.) */
  tweets?: string;
  /** Official releases, statements, filings, press releases */
  releases?: string;
  /** Textual description of charts (TradingView, etc.) — links are NOT read */
  chartNotes?: string;
  /** Pasted reference article text */
  referenceText?: string;
  /** Reference URLs (used only as attribution hints — not fetched) */
  referenceUrls?: string;
  /** Editor's key ideas / angle / must-include points */
  keyIdeas?: string;
  /** Optional hint about the desired category */
  categoryHint?: string;
}

export interface ArticleDraft {
  title: string;
  excerpt: string;
  body: string;
  categorySlug: CategorySlug;
  tags: string[];
}

const draftSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  categorySlug: z.enum(CATEGORY_SLUGS).catch("analysis"),
  tags: z.array(z.string().min(1)).max(8).catch([]),
});

const SYSTEM_PROMPT = `You are the senior markets editor for "The Forex Republic", a Bloomberg/CoinDesk-inspired financial news publication covering crypto, forex, stocks, macro, gold, and market analysis.

You turn raw source material into a polished, publication-ready article draft. Write in a professional, precise, neutral-but-confident house voice for traders and finance professionals. Avoid hype, financial advice, price predictions stated as fact, and filler. Attribute claims to their sources ("according to", "said") and never invent quotes, figures, or events that are not present in the provided sources.

You must return ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
- "title": string. A sharp, specific, SEO-aware headline. Do NOT include a leading "#".
- "excerpt": string. One or two sentences (max ~300 chars) summarizing the article.
- "body": string. The full article in GitHub-flavored Markdown following the EXACT house structure below.
- "categorySlug": string. One of: crypto, forex, stocks, macro, gold, analysis, opinion. Pick the single best fit.
- "tags": array of 3-6 short lowercase tag strings (e.g. "bitcoin", "federal reserve", "eurusd").

The "body" markdown MUST follow this house structure and heading order:

# <Title> (H1, same as the title field)

## Key Pointers
- 3 to 5 concise bullet points capturing the most important takeaways.

## Introduction
1-2 short paragraphs framing the story and why it matters now.

## Market Context
Background and the broader setup around the story.

## Analysis
Deeper interpretation of the implications, risks, and what it means for traders.

## Technical Analysis
Price structure, support/resistance, levels, correlations. Base this ONLY on the chart notes / descriptions provided. If no chart information is given, say the technical picture is limited to the described levels and avoid fabricating specific numbers.

## Market Takeaway
A short, forward-looking closing section with the net conclusion.

Rules:
- Use only the information provided in the sources. Do not fabricate data. If sources are thin, keep sections shorter rather than inventing content.
- Keep the markdown clean: real newlines between sections, "## " headings, "- " bullets.
- The title field and the H1 in body must match.`;

function buildUserPrompt(sources: ArticleSources): string {
  const parts: string[] = [];
  const add = (label: string, value?: string) => {
    const v = value?.trim();
    if (v) parts.push(`### ${label}\n${v}`);
  };
  add("Editor's key ideas / angle", sources.keyIdeas);
  add("Tweet / social post text", sources.tweets);
  add("Official releases / statements", sources.releases);
  add("Chart notes / descriptions (links are NOT fetched)", sources.chartNotes);
  add("Reference article text", sources.referenceText);
  add("Reference URLs (attribution hints only, not fetched)", sources.referenceUrls);
  add("Category hint", sources.categoryHint);

  if (parts.length === 0) {
    parts.push("(No sources were provided. Ask for sources — but still return valid JSON with a placeholder draft explaining that sources are required.)");
  }

  return `Draft a "The Forex Republic" article from the following raw sources.\n\n${parts.join(
    "\n\n"
  )}\n\nReturn only the JSON object described in the system instructions.`;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

/**
 * Generate a structured article draft from raw sources using OpenAI.
 * Requests structured JSON output and validates it before returning.
 */
export async function generateArticleDraft(
  sources: ArticleSources
): Promise<ArticleDraft> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(sources) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  const result = draftSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response did not match the expected draft shape");
  }

  return result.data;
}

export interface GeneratedImage {
  /** Raw image bytes to persist (e.g. to Vercel Blob). */
  buffer: Buffer;
  contentType: string;
}

/**
 * Generate a single editorial image (cover or card thumbnail) from a short
 * prompt. Uses the cheapest configured image model at low quality to keep spend
 * minimal — image generation is opt-in per article, never automatic.
 *
 * Defaults: model `gpt-image-1` at `quality: "low"`, 1024x1024. Override with
 * OPENAI_IMAGE_MODEL / OPENAI_IMAGE_QUALITY / OPENAI_IMAGE_SIZE.
 */
export async function generateArticleImage(prompt: string): Promise<GeneratedImage> {
  const trimmed = prompt.trim();
  if (!trimmed) throw new Error("An image prompt is required");

  const openai = getClient();
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
  const size = (process.env.OPENAI_IMAGE_SIZE ?? "1024x1024") as
    | "1024x1024"
    | "1024x1536"
    | "1536x1024";
  const quality = (process.env.OPENAI_IMAGE_QUALITY ?? "low") as
    | "low"
    | "medium"
    | "high";

  const response = await openai.images.generate({
    model,
    prompt: trimmed,
    n: 1,
    size,
    // `quality` is only honored by gpt-image-* models; harmless otherwise.
    ...(model.startsWith("gpt-image") ? { quality } : {}),
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI returned no image data");
  }

  return { buffer: Buffer.from(b64, "base64"), contentType: "image/png" };
}

/**
 * Build a concise, house-style image prompt from an article's core fields.
 * Kept short on purpose — image cost is per-image, not per-token.
 */
export function buildImagePrompt(input: {
  title: string;
  excerpt?: string;
  categorySlug?: string;
  kind?: "cover" | "thumbnail";
}): string {
  const { title, excerpt, categorySlug, kind = "cover" } = input;
  const topic = [title, excerpt].filter(Boolean).join(". ");
  const subject = categorySlug ? `${categorySlug} financial markets` : "financial markets";
  return [
    `Professional editorial ${kind} image for a financial news article about ${subject}.`,
    `Topic: ${topic}.`,
    "Clean, modern, Bloomberg/CoinDesk-style photojournalistic or abstract data-driven visual.",
    "No text, no words, no logos, no watermarks. Muted professional color palette.",
  ].join(" ");
}

import OpenAI from "openai";
import { z } from "zod";
import {
  buildBreakingSystemPrompt,
  buildSystemPrompt,
  findStyleViolations,
  type StoryType,
} from "@/lib/house-style";

/**
 * OpenAI-backed article drafting for The Forex Republic.
 *
 * Takes raw editorial sources (tweet text, official releases, chart notes,
 * reference article text/URLs, and key ideas) and produces a structured,
 * house-style article draft ready to prefill the CMS form.
 *
 * The editorial rules themselves live in src/lib/house-style.ts, which selects a
 * different outline per story type. This module only handles the OpenAI plumbing
 * and output validation.
 *
 * NOTE: Live chart URLs (e.g. TradingView) cannot be fetched or "read" by the
 * model. Real price levels are computed in src/lib/technicals.ts and passed in
 * via `technicalBlock`; anything else must be described in `chartNotes`.
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
  /**
   * Which kind of story this is. Selects the outline, and decides whether a
   * technical section is permitted at all. Defaults to "general".
   */
  storyType?: StoryType;
  /**
   * Pre-rendered block of technical levels computed from real market data (see
   * formatTechnicalBlock in src/lib/technicals.ts). When present, the model may
   * cite these numbers and no others in the technical section.
   */
  technicalBlock?: string;
  /**
   * Several outlets' reports on the SAME story, to be synthesised into one
   * original piece rather than paraphrased individually.
   */
  reports?: SourceReport[];
}

/** One outlet's coverage of a story, used as raw material for synthesis. */
export interface SourceReport {
  outlet: string;
  headline: string;
  summary: string;
  url: string;
  publishedAt?: Date | null;
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

function buildUserPrompt(sources: ArticleSources): string {
  const parts: string[] = [];
  const add = (label: string, value?: string) => {
    const v = value?.trim();
    if (v) parts.push(`### ${label}\n${v}`);
  };

  // Multi-outlet reports come first: they are the substance of the piece, and
  // the synthesis instruction is what stops the model tracking one source.
  if (sources.reports && sources.reports.length > 0) {
    const reports = sources.reports
      .map((r, i) => {
        const when = r.publishedAt ? ` (${r.publishedAt.toISOString().slice(0, 16).replace("T", " ")} UTC)` : "";
        return `[Report ${i + 1}] ${r.outlet}${when}\nHeadline: ${r.headline}\nSummary: ${r.summary || "(no summary provided)"}`;
      })
      .join("\n\n");

    const synthesis =
      sources.reports.length > 1
        ? `These ${sources.reports.length} reports from ${new Set(sources.reports.map((r) => r.outlet)).size} outlets cover the SAME story. Write ONE original article that synthesises them: establish what they agree on, note where they differ or add detail the others lack, and build a fuller picture than any single report gives. Do not follow the structure or phrasing of any one report, and do not write a summary of "what outlets are saying" — write the story itself.`
        : `Write an original article on this story. Do not mirror the source's structure or phrasing.`;

    parts.push(`### Source reports\n${synthesis}\n\n${reports}`);
  }

  add("Editor's key ideas / angle", sources.keyIdeas);
  add("Tweet / social post text", sources.tweets);
  add("Official releases / statements", sources.releases);
  add("Chart notes / descriptions (links are NOT fetched)", sources.chartNotes);
  add("Reference article text", sources.referenceText);
  add("Reference URLs (attribution hints only, not fetched)", sources.referenceUrls);
  add("Category hint", sources.categoryHint);

  if (sources.technicalBlock?.trim()) {
    parts.push(sources.technicalBlock.trim());
  }

  if (parts.length === 0) {
    parts.push("(No sources were provided. Ask for sources — but still return valid JSON with a placeholder draft explaining that sources are required.)");
  }

  return `Write a "The Forex Republic" article from the following material.\n\n${parts.join(
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
    // Higher than the old 0.5: uniform phrasing is the main "robotic" tell, and
    // fabrication is constrained by the prompt and the due-diligence pass rather
    // than by keeping the sampler cold.
    temperature: 0.8,
    presence_penalty: 0.3,
    frequency_penalty: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(sources.storyType ?? "general") },
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

  return expandIfThin(result.data, sources, model);
}

/**
 * If the first pass came back as a stub, ask once for a deeper version.
 *
 * Smaller models reliably under-write when the source material is a one-line
 * feed blurb, and no amount of prompt emphasis fixes it in a single pass. One
 * conditional follow-up call is cheap (it only fires on short drafts) and is
 * framed as "develop the analysis", not "make it longer", so the model adds
 * reasoning rather than padding.
 */
async function expandIfThin(
  draft: ArticleDraft,
  sources: ArticleSources,
  model: string
): Promise<ArticleDraft> {
  const tooShort = findStyleViolations(draft.body).some((v) => v.startsWith("Too short"));
  if (!tooShort) return draft;

  const openai = getClient();
  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(sources.storyType ?? "general") },
        { role: "user", content: buildUserPrompt(sources) },
        { role: "assistant", content: JSON.stringify(draft) },
        {
          role: "user",
          content: `This draft is too short and under-developed: it does not meet the structural requirements (opening of 2-3 paragraphs, then 3-4 "## " sections, each of at least 3 paragraphs of at least 3 sentences).

Rewrite it in full, keeping the reporting and every existing fact exactly as it is, and develop the analysis to meet those requirements. Add depth ONLY through: the mechanism behind the move, second-order effects and the channels they travel through, the counter-case, how this compares with the recent run of prints and where we are in the policy cycle, and what specifically would change the picture.

Do not add a single figure, price, date, quote or named institution that is not already in the source material. Do not repeat points you have already made. Return the same JSON shape.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return draft;
    const expanded = draftSchema.safeParse(JSON.parse(content));
    if (!expanded.success) return draft;

    // Only accept the rewrite if it is actually more developed.
    return expanded.data.body.length > draft.body.length ? expanded.data : draft;
  } catch {
    // The first draft is still usable; a human reviews it either way.
    return draft;
  }
}

/**
 * Automated editorial due-diligence result for a generated draft. This is an
 * assist for the human reviewer — never an auto-publish gate. A low score or
 * any flags simply surface prominently in the review queue.
 */
export interface DueDiligenceResult {
  /** 0-100: how well-supported and publication-ready the draft looks. */
  score: number;
  /** Overall verdict the reviewer should weigh. */
  verdict: "pass" | "review" | "flag";
  /** Specific issues found (unsupported claims, tone, fabrication risk, ...). */
  flags: string[];
  /** One or two sentence human-readable summary. */
  notes: string;
  /** Deterministic house-style breaches found locally (banned phrases etc.). */
  styleViolations?: string[];
}

const dueDiligenceSchema = z.object({
  score: z.number().min(0).max(100).catch(50),
  verdict: z.enum(["pass", "review", "flag"]).catch("review"),
  flags: z.array(z.string().min(1)).max(12).catch([]),
  notes: z.string().catch(""),
});

const DUE_DILIGENCE_SYSTEM_PROMPT = `You are a rigorous editorial fact-checker and standards editor for "The Forex Republic", a financial news publication. You are given (a) the original SOURCE material an article was drafted from and (b) the DRAFT article. Your job is to assess whether the draft is well-supported by the source, free of fabricated specifics, appropriately hedged, and ready for a human editor's final approval.

Check specifically for:
- Fabrication: any specific figure, price, percentage, date, statistic, or direct quote in the draft that is NOT present in or directly supported by the source material.
- Overreach: claims stated as fact that should be hedged, price predictions stated as certainty, or financial advice.
- Attribution: whether claims that need a source are attributed.
- Tone/quality: hype, filler, or missing sections of the required house structure.

Return ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
- "score": number 0-100. How well-supported and publication-ready the draft is. 85+ = clean, 60-84 = minor issues, below 60 = significant issues.
- "verdict": one of "pass" (clean, minor or no issues), "review" (some issues a human should check), "flag" (serious issues like likely fabrication).
- "flags": array of short specific strings, one per issue found (empty array if none). Quote or name the specific problematic claim where possible.
- "notes": one or two sentences summarizing your assessment for the reviewer.

Be strict about fabricated numbers and quotes, but do not penalize clearly-hedged analysis or general market context that a knowledgeable editor would add.`;

/**
 * Run an automated due-diligence pass on a generated draft, comparing it to the
 * source material it was drafted from. Returns a structured assessment for the
 * human review queue. This never blocks or auto-publishes anything.
 */
export async function runDueDiligence(
  draft: ArticleDraft,
  sources: ArticleSources
): Promise<DueDiligenceResult> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const sourceBlock = buildUserPrompt(sources);
  const userContent = `SOURCE MATERIAL the article was drafted from:\n\n${sourceBlock}\n\n---\n\nDRAFT ARTICLE to assess:\n\nTITLE: ${draft.title}\n\nEXCERPT: ${draft.excerpt}\n\nBODY:\n${draft.body}\n\nReturn only the JSON object described in the system instructions.`;

  // Local, free checks run regardless of what the model reports.
  const styleViolations = findStyleViolations(draft.body);
  const echoedHeadline = sources.reports?.some(
    (r) => headlineSimilarity(r.headline, draft.title) > 0.7
  );

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: DUE_DILIGENCE_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty due-diligence response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid due-diligence JSON");
  }

  const result = dueDiligenceSchema.parse(parsed);

  const extraFlags = [...styleViolations];
  if (echoedHeadline) {
    extraFlags.push("Headline closely mirrors a source headline — needs reframing");
  }

  return {
    ...result,
    // Style breaches are objective, so they lower the score deterministically
    // instead of relying on the model to notice them.
    score: Math.max(0, result.score - Math.min(30, extraFlags.length * 8)),
    flags: [...result.flags, ...extraFlags],
    styleViolations,
  };
}

/** Word-overlap ratio between two headlines, used to catch source echoing. */
function headlineSimilarity(a: string, b: string): number {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
  const sa = norm(a);
  const sb = norm(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let shared = 0;
  sa.forEach((w) => {
    if (sb.has(w)) shared++;
  });
  return shared / Math.min(sa.size, sb.size);
}

/**
 * Write a short breaking brief on an event that has already happened.
 *
 * Two deliberate differences from generateArticleDraft: temperature is low,
 * because there is no room for voice in 150 words of fact, and there is no
 * expand-if-thin retry — short is the point, not a defect.
 */
export async function generateBreakingBrief(
  sources: ArticleSources
): Promise<ArticleDraft> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildBreakingSystemPrompt() },
      { role: "user", content: buildUserPrompt(sources) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response");

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

/**
 * Numbers in the copy that do not appear anywhere in the source material.
 *
 * This is the auto-publish lane's last line of defence, and it is arithmetic
 * rather than a model opinion: every numeric token in the brief is looked for in
 * the sources, and anything unaccounted for sends the piece to the review queue
 * instead of the front page. It is intentionally literal — a figure the model
 * rounded or recomputed will not match, which is the desired outcome.
 */
export function findUnsourcedFigures(body: string, sourceText: string): string[] {
  // Digits with optional decimals, ignoring markdown and currency punctuation.
  const inSources = new Set(sourceText.match(/\d+(?:[.,]\d+)*/g) ?? []);
  const unsourced = new Set<string>();

  for (const token of body.match(/\d+(?:[.,]\d+)*/g) ?? []) {
    if (inSources.has(token)) continue;
    // A bare small integer is prose ("three of the nine members"), a year, or a
    // count the sources spelled out in words. Only flag figures precise enough
    // to be a market number.
    const numeric = Number(token.replace(/,/g, ""));
    if (!token.includes(".") && Number.isInteger(numeric) && numeric < 100) continue;
    unsourced.add(token);
  }

  return Array.from(unsourced).map((t) => `Figure "${t}" does not appear in the source material`);
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

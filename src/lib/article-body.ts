/**
 * Shared article body cleanup for generate-time and render-time.
 *
 * Older drafts often end with multi-outlet credit lines ("reporting informed by…")
 * or Sources/References appendices. Readers should never see those; pages render
 * a fixed AI+human disclosure instead.
 */

export const AI_HUMAN_DISCLOSURE =
  "Written and fact-checked with AI assistance, reviewed by a human editor before publication.";

/**
 * Remove trailing source/credit footers from markdown so public + preview
 * pages stay clean without a DB migration.
 */
export function stripCreditFooters(body: string): string {
  if (!body) return body;
  let cleaned = body;

  // Cut from the first trailing source-section heading to end-of-document.
  cleaned = cleaned.replace(
    /\n#{1,3}\s*(sources?|source reports?|references?|further reading|attribution|credits?)\b[^\n]*\n[\s\S]*$/i,
    ""
  );

  // Horizontal-rule footer that is a sources / reporting credit dump.
  cleaned = cleaned.replace(
    /\n---+\s*\n+(?:\*?\s*)?(?:sources?|source reports?|references?|further reading|reporting informed by|based on reports from|coverage informed by)\b[\s\S]*$/i,
    ""
  );

  // Bare "Source reports" / "Sources:" prose blocks late in the piece.
  cleaned = cleaned.replace(/\n(?:\*\*)?source reports?(?:\*\*)?\s*:?\s*\n[\s\S]*$/i, "");
  cleaned = cleaned.replace(/\n(?:\*\*)?sources?(?:\*\*)?\s*:\s*\n[\s\S]*$/i, "");

  // Trailing italic/plain credit sentences (with or without a preceding rule).
  cleaned = cleaned.replace(
    /\n+(?:\*|_+)?\s*(?:reporting informed by|based on reports from|coverage informed by|this (?:article|piece|report) (?:was )?(?:informed by|based on reports from))\b[^\n]*(?:\*|_+)?\s*$/i,
    ""
  );

  // Multi-line credit dump after a blank line near the end (no heading).
  cleaned = cleaned.replace(
    /\n{2,}(?:\*|_+)?\s*(?:reporting informed by|based on reports from|coverage informed by)\b[\s\S]*$/i,
    ""
  );

  return cleaned.trimEnd();
}

function normalizeTitleKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[#*_`~>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip a leading markdown `# Title` or first HTML `<h1>` when it duplicates
 * the article title, so the page template H1 is the only H1.
 */
export function stripDuplicateTitleHeading(body: string, title: string): string {
  if (!body || !title) return body;
  const titleKey = normalizeTitleKey(title);
  if (!titleKey) return body;

  let cleaned = body.replace(/^\uFEFF/, "").replace(/^\s+/, "");

  const mdMatch = cleaned.match(/^#\s+(.+?)(?:\r?\n|$)/);
  if (mdMatch && normalizeTitleKey(mdMatch[1]) === titleKey) {
    return cleaned.slice(mdMatch[0].length).replace(/^\s+/, "");
  }

  const htmlMatch = cleaned.match(/^<h1\b[^>]*>([\s\S]*?)<\/h1>\s*/i);
  if (htmlMatch && normalizeTitleKey(htmlMatch[1].replace(/<[^>]+>/g, "")) === titleKey) {
    return cleaned.slice(htmlMatch[0].length).replace(/^\s+/, "");
  }

  return body;
}


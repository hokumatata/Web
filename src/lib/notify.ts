/**
 * Best-effort reviewer notifications for the journalist agent.
 *
 * When the scheduled agent drafts new articles into the review queue, this pings
 * a Slack channel (if SLACK_WEBHOOK_URL is set) so a human knows there are drafts
 * awaiting approval. Entirely optional — never throws into the caller.
 */

export interface ReviewQueueItem {
  title: string;
  source: string;
  score: number | null;
  verdict: "pass" | "review" | "flag" | null;
}

function reviewQueueUrl(): string | null {
  const base = process.env.SITE_URL?.replace(/\/$/, "");
  return base ? `${base}/admin/articles/review` : null;
}

/**
 * Notify the configured Slack webhook that new drafts are awaiting review.
 * No-op when SLACK_WEBHOOK_URL is unset. Swallows all errors.
 */
export async function notifyReviewQueue(items: ReviewQueueItem[]): Promise<void> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook || items.length === 0) return;

  const url = reviewQueueUrl();
  const lines = items.map((i) => {
    const badge =
      i.verdict === "flag"
        ? ":rotating_light: FLAG"
        : i.verdict === "review"
        ? ":mag: review"
        : i.verdict === "pass"
        ? ":white_check_mark: pass"
        : "";
    const score = i.score != null ? ` (${i.score}/100)` : "";
    return `• *${i.title}* — _${i.source}_ ${badge}${score}`.trim();
  });

  const text = [
    `:newspaper: ${items.length} new draft${items.length === 1 ? "" : "s"} awaiting review on The Forex Republic:`,
    ...lines,
    url ? `\nReview & approve: ${url}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // best-effort only
  }
}

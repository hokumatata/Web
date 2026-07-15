import { prisma } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const BRIEF_NAME = "The Daily Macro Brief";

/** Build an HTML edition of the Daily Macro Brief from the latest published articles. */
export async function buildDailyBriefHtml(): Promise<{ subject: string; preview: string; bodyHtml: string }> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 10,
    include: { category: { select: { name: true } } },
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const subject = `${BRIEF_NAME} — ${today}`;
  const preview = articles[0]?.title ?? "Today's market-moving stories.";

  const items = articles
    .map(
      (a) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #1f2937;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#ff7a00;font-weight:700;">${a.category.name}</div>
          <a href="${SITE_URL}/article/${a.slug}" style="font-size:16px;font-weight:600;color:#f3f4f6;text-decoration:none;line-height:1.4;display:block;margin-top:4px;">${a.title}</a>
          <div style="font-size:13px;color:#9ca3af;margin-top:4px;line-height:1.5;">${a.excerpt}</div>
        </td>
      </tr>`
    )
    .join("");

  const bodyHtml = `<!DOCTYPE html>
<html><body style="margin:0;background:#0b1120;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;padding:0 20px;">
        <tr><td style="padding-bottom:8px;">
          <div style="font-size:20px;font-weight:800;color:#f3f4f6;">${BRIEF_NAME}</div>
          <div style="font-size:12px;color:#9ca3af;">${today} · ${SITE_NAME}</div>
        </td></tr>
        <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table></td></tr>
        <tr><td style="padding-top:20px;font-size:12px;color:#6b7280;">
          You are receiving this because you subscribed at <a href="${SITE_URL}" style="color:#ff7a00;">${SITE_URL}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, preview, bodyHtml };
}

export function isDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Send an edition to all subscribers via Resend. No-op (returns 0) if RESEND_API_KEY is unset. */
export async function sendIssue(subject: string, bodyHtml: string): Promise<number> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return 0;

  const from = process.env.NEWSLETTER_FROM ?? `${BRIEF_NAME} <brief@theforexrepublic.com>`;
  const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) return 0;

  // Resend batch API: up to 100 recipients per call via BCC.
  const batches: string[][] = [];
  for (let i = 0; i < subscribers.length; i += 90) {
    batches.push(subscribers.slice(i, i + 90).map((s) => s.email));
  }

  let sent = 0;
  for (const batch of batches) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: from, bcc: batch, subject, html: bodyHtml }),
    });
    if (res.ok) sent += batch.length;
  }
  return sent;
}

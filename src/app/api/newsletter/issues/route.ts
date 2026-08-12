import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { requireExactRole } from "@/lib/auth";
import { buildDailyBriefHtml, sendIssue, isDeliveryConfigured } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export async function GET() {
  const issues = await prisma.newsletterIssue.findMany({
    where: { status: "SENT" },
    orderBy: { sentAt: "desc" },
    select: { slug: true, subject: true, preview: true, sentAt: true, recipients: true },
    take: 100,
  });
  return json(issues);
}

/** Generate today's Daily Macro Brief and (optionally) send it.
 *  Authorized via an ADMIN session OR a Bearer CRON_SECRET (for scheduled delivery). */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const cronAuthorized = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

  if (!cronAuthorized) {
    const auth = await requireExactRole("ADMIN");
    if (!auth.ok) return unauthorized();
  }

  const send = req.nextUrl.searchParams.get("send") === "1";
  const { subject, preview, bodyHtml } = await buildDailyBriefHtml();
  const slug = `${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 7)}`;

  let recipients = 0;
  let status = "DRAFT";
  if (send) {
    recipients = await sendIssue(subject, bodyHtml);
    status = "SENT";
  }

  const issue = await prisma.newsletterIssue.create({
    data: {
      slug,
      subject,
      preview,
      bodyHtml,
      status,
      recipients,
      sentAt: send ? new Date() : null,
    },
  });

  return json({ ok: true, issue: { slug: issue.slug, subject, recipients }, deliveryConfigured: isDeliveryConfigured() }, 201);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error, tooManyRequests, unauthorized, forbidden } from "@/lib/api";
import { requireExactRole } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/** Subscriber list — staff only. Public subscribe remains on POST. */
export async function GET() {
  const auth = await requireExactRole("ADMIN");
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  return json(subs);
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`newsletter:${getClientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { email } = await req.json();
  if (!email || !email.includes("@")) return error("Valid email is required");

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return json({ ok: true, message: "Already subscribed" });

  await prisma.newsletterSubscriber.create({ data: { email } });
  return json({ ok: true }, 201);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, error } from "@/lib/api";

export async function GET() {
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  return json(subs);
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) return error("Valid email is required");

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return json({ ok: true, message: "Already subscribed" });

  await prisma.newsletterSubscriber.create({ data: { email } });
  return json({ ok: true }, 201);
}

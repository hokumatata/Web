import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: session.uid },
  });

  return json(prefs ?? { topicsJson: "[]", emailDigest: false, theme: "dark" });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await req.json();

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: session.uid },
    update: {
      ...(body.topicsJson !== undefined ? { topicsJson: body.topicsJson } : {}),
      ...(body.emailDigest !== undefined ? { emailDigest: body.emailDigest } : {}),
      ...(body.theme !== undefined ? { theme: body.theme } : {}),
    },
    create: {
      userId: session.uid,
      topicsJson: body.topicsJson ?? "[]",
      emailDigest: body.emailDigest ?? false,
      theme: body.theme ?? "dark",
    },
  });

  return json(prefs);
}

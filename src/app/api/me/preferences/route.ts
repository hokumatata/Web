import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromZodError, ok, unauthorized } from "@/lib/api";

const Body = z.object({
  topics: z.array(z.string()).optional(),
  emailDigest: z.boolean().optional(),
  theme: z.enum(["dark", "light"]).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  const p = await prisma.userPreferences.upsert({
    where: { userId: session.uid },
    update: {},
    create: { userId: session.uid },
  });
  return ok({ ...p, topics: safeParseList(p.topicsJson) });
}

function safeParseList(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZodError(parsed.error);

  const updated = await prisma.userPreferences.upsert({
    where: { userId: session.uid },
    create: {
      userId: session.uid,
      ...(parsed.data.topics ? { topicsJson: JSON.stringify(parsed.data.topics) } : {}),
      ...(parsed.data.emailDigest !== undefined ? { emailDigest: parsed.data.emailDigest } : {}),
      ...(parsed.data.theme ? { theme: parsed.data.theme } : {}),
    },
    update: {
      ...(parsed.data.topics ? { topicsJson: JSON.stringify(parsed.data.topics) } : {}),
      ...(parsed.data.emailDigest !== undefined ? { emailDigest: parsed.data.emailDigest } : {}),
      ...(parsed.data.theme ? { theme: parsed.data.theme } : {}),
    },
  });
  return ok({ ...updated, topics: safeParseList(updated.topicsJson) });
}

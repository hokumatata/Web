import { prisma } from "./db";

export async function audit(
  actorId: string | null,
  action: string,
  target?: string,
  meta?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? undefined,
      action,
      target,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
}

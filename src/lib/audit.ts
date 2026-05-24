import { prisma } from "./db";

export async function audit(
  actorId: string | null,
  action: string,
  target?: string,
  meta?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      target,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
}

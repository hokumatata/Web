import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Audit log" };
export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const session = (await getSession())!;
  if (session.role !== "ADMIN") redirect("/admin");
  const items = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Operations</span>
          <h1 className="font-serif text-2xl">Audit log</h1>
        </div>
        <span className="text-2xs uppercase tracking-wider text-ink-300">{items.length} recent events</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-ink-300">
            <tr className="border-b border-ink-700">
              <th className="px-4 py-2 text-left">When</th>
              <th className="px-4 py-2 text-left">Actor</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Target</th>
              <th className="px-4 py-2 text-left">Meta</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-300">No entries.</td></tr>
            )}
            {items.map((a) => (
              <tr key={a.id} className="border-b border-ink-800 last:border-b-0 align-top">
                <td className="px-4 py-2 text-2xs tabular text-ink-300">{timeAgo(a.createdAt)}</td>
                <td className="px-4 py-2 text-ink-200">{a.actor?.name ?? "—"}</td>
                <td className="px-4 py-2 text-ink-100 font-mono text-xs">{a.action}</td>
                <td className="px-4 py-2 text-ink-300 font-mono text-xs">{a.target ?? "—"}</td>
                <td className="px-4 py-2 text-2xs text-ink-300 font-mono break-all">{a.meta ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

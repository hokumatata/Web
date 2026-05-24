import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Audit Log" };

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">Audit Log</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-850">
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Time</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Actor</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Action</th>
              <th className="text-left px-4 py-3 text-2xs uppercase tracking-wider text-ink-400 font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-ink-800/50 hover:bg-ink-850">
                <td className="px-4 py-3 text-ink-400 text-xs font-mono">{formatDate(l.createdAt)}</td>
                <td className="px-4 py-3 text-ink-200">{l.actor?.name ?? "System"}</td>
                <td className="px-4 py-3"><span className="badge">{l.action}</span></td>
                <td className="px-4 py-3 text-ink-300 text-xs truncate max-w-xs">{l.target ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-ink-400 text-center py-8">No audit log entries yet.</p>}
      </div>
    </div>
  );
}

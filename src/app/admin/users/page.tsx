import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { UsersManager } from "@/components/admin/UsersManager";

export const metadata = { title: "Admin · Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = (await getSession())!;
  if (session.role !== "ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div>
      <div className="section-title">
        <div>
          <span className="kicker">Identity</span>
          <h1 className="font-serif text-2xl">Users</h1>
        </div>
        <span className="text-2xs uppercase tracking-wider text-ink-300">{users.length} total</span>
      </div>
      <UsersManager
        currentUserId={session.uid}
        items={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

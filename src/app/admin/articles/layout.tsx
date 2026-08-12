import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isAdmin, isEditor } from "@/lib/types";

/**
 * Editorial CMS under /admin/articles is for EDITORS.
 * ADMIN is ops-only (users, authors, categories, …) and is sent home.
 */
export default async function AdminArticlesLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (isAdmin(session.role) || !isEditor(session.role)) redirect("/admin");
  return children;
}

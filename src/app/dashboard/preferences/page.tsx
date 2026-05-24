import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PreferencesForm } from "@/components/dashboard/PreferencesForm";

export const metadata = { title: "Preferences" };

export default async function PreferencesPage() {
  const session = await getSession();
  if (!session) return null;

  const [prefs, categories] = await Promise.all([
    prisma.userPreferences.findUnique({ where: { userId: session.uid } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-ink-50 mb-6">Preferences</h2>
      <div className="card p-6">
        <PreferencesForm
          prefs={prefs ?? { topicsJson: "[]", emailDigest: false, theme: "dark" }}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </div>
    </div>
  );
}

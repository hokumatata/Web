import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PreferencesForm } from "@/components/dashboard/PreferencesForm";
import { safeJsonParse } from "@/lib/utils";

export const metadata = { title: "Preferences" };

export default async function PreferencesPage() {
  const session = (await getSession())!;
  const [prefs, categories] = await Promise.all([
    prisma.userPreferences.upsert({
      where: { userId: session.uid },
      update: {},
      create: { userId: session.uid },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <div className="section-title">
        <h2>Preferences</h2>
      </div>
      <PreferencesForm
        initial={{
          topics: safeJsonParse<string[]>(prefs.topicsJson, []),
          emailDigest: prefs.emailDigest,
          theme: (prefs.theme as "dark" | "light") ?? "dark",
        }}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}

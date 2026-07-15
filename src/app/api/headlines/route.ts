import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export interface HeadlineItem {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  publishedAt: string | null;
  isBreaking: boolean;
  views: number;
}

export async function GET() {
  try {
    const [latest, mostRead] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 40,
        select: {
          slug: true,
          title: true,
          publishedAt: true,
          isBreaking: true,
          views: true,
          category: { select: { slug: true, name: true } },
        },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { views: "desc" },
        take: 6,
        select: {
          slug: true,
          title: true,
          publishedAt: true,
          isBreaking: true,
          views: true,
          category: { select: { slug: true, name: true } },
        },
      }),
    ]);

    const toItem = (a: (typeof latest)[number]): HeadlineItem => ({
      slug: a.slug,
      title: a.title,
      categorySlug: a.category.slug,
      categoryName: a.category.name,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      isBreaking: a.isBreaking,
      views: a.views,
    });

    return NextResponse.json(
      {
        latest: latest.map(toItem),
        breaking: latest.filter((a) => a.isBreaking).map(toItem),
        mostRead: mostRead.map(toItem),
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ latest: [], breaking: [], mostRead: [] }, { status: 200 });
  }
}

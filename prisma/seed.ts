import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { newsArticles, articleTagMap, type AuthorKey } from "../src/data/newsData";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const editorHash = await bcrypt.hash("editor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@tradewave.io" },
    update: {},
    create: {
      email: "admin@tradewave.io",
      passwordHash: adminHash,
      name: "Sarah Chen",
      role: "ADMIN",
      authorProfile: {
        create: {
          slug: "sarah-chen",
          bio: "Editor-in-chief covering global macro and digital assets.",
          twitter: "@sarahchen",
        },
      },
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@tradewave.io" },
    update: {},
    create: {
      email: "editor@tradewave.io",
      passwordHash: editorHash,
      name: "Marcus Webb",
      role: "EDITOR",
      authorProfile: {
        create: {
          slug: "marcus-webb",
          bio: "Senior markets reporter with a focus on crypto and DeFi.",
          twitter: "@marcuswebb",
        },
      },
    },
  });

  const author1Hash = await bcrypt.hash("author123", 10);
  const author1 = await prisma.user.upsert({
    where: { email: "alex@tradewave.io" },
    update: {},
    create: {
      email: "alex@tradewave.io",
      passwordHash: author1Hash,
      name: "Alex Rivera",
      role: "AUTHOR",
      authorProfile: {
        create: {
          slug: "alex-rivera",
          bio: "FX and rates analyst covering G10 and emerging markets.",
        },
      },
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "crypto" }, update: {}, create: { slug: "crypto", name: "Crypto", description: "Digital assets, DeFi, and blockchain", order: 1 } }),
    prisma.category.upsert({ where: { slug: "forex" }, update: {}, create: { slug: "forex", name: "Forex", description: "Currency markets and central bank policy", order: 2 } }),
    prisma.category.upsert({ where: { slug: "stocks" }, update: {}, create: { slug: "stocks", name: "Stocks", description: "Equities, IPOs, and corporate earnings", order: 3 } }),
    prisma.category.upsert({ where: { slug: "macro" }, update: {}, create: { slug: "macro", name: "Macro", description: "Global economics, rates, and fiscal policy", order: 4 } }),
    prisma.category.upsert({ where: { slug: "gold" }, update: {}, create: { slug: "gold", name: "Gold", description: "Gold markets, precious metals, and commodities", order: 5 } }),
    prisma.category.upsert({ where: { slug: "analysis" }, update: {}, create: { slug: "analysis", name: "Analysis", description: "Deep dives and research notes", order: 6 } }),
    prisma.category.upsert({ where: { slug: "opinion" }, update: {}, create: { slug: "opinion", name: "Opinion", description: "Commentary and editorials", order: 7 } }),
  ]);

  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: "bitcoin" }, update: {}, create: { slug: "bitcoin", name: "Bitcoin" } }),
    prisma.tag.upsert({ where: { slug: "ethereum" }, update: {}, create: { slug: "ethereum", name: "Ethereum" } }),
    prisma.tag.upsert({ where: { slug: "defi" }, update: {}, create: { slug: "defi", name: "DeFi" } }),
    prisma.tag.upsert({ where: { slug: "fed" }, update: {}, create: { slug: "fed", name: "Federal Reserve" } }),
    prisma.tag.upsert({ where: { slug: "regulation" }, update: {}, create: { slug: "regulation", name: "Regulation" } }),
    prisma.tag.upsert({ where: { slug: "earnings" }, update: {}, create: { slug: "earnings", name: "Earnings" } }),
    prisma.tag.upsert({ where: { slug: "ai" }, update: {}, create: { slug: "ai", name: "AI" } }),
    prisma.tag.upsert({ where: { slug: "inflation" }, update: {}, create: { slug: "inflation", name: "Inflation" } }),
  ]);

  const authorIdByKey: Record<AuthorKey, string> = {
    admin: admin.id,
    editor: editor.id,
    author1: author1.id,
  };
  const categoryIdBySlug: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.slug, c.id])
  );

  for (const data of newsArticles) {
    const existing = await prisma.article.findUnique({ where: { slug: data.slug } });
    if (existing) continue;
    await prisma.article.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImageUrl: data.coverImageUrl,
        status: data.status,
        isFeatured: data.isFeatured ?? false,
        isBreaking: data.isBreaking ?? false,
        publishedAt: new Date(Date.now() - data.publishedAgoMs),
        authorId: authorIdByKey[data.authorKey],
        categoryId: categoryIdBySlug[data.categorySlug],
      },
    });
  }

  for (const [articleSlug, tagSlugs] of Object.entries(articleTagMap)) {
    const article = await prisma.article.findUnique({ where: { slug: articleSlug } });
    if (!article) continue;
    for (const tagSlug of tagSlugs) {
      const tag = tags.find((t) => t.slug === tagSlug);
      if (!tag) continue;
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
        update: {},
        create: { articleId: article.id, tagId: tag.id },
      });
    }
  }

  console.log("Seed completed successfully!");
  console.log(`Created ${newsArticles.length} articles, ${categories.length} categories, ${tags.length} tags`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

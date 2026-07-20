import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { newsArticles, articleTagMap, type AuthorKey } from "../src/data/newsData";

const prisma = new PrismaClient();

async function main() {
  // ------------------------------------------------------------------
  // 1. Clear old articles, tags, and article-tag relations
  // ------------------------------------------------------------------
  await prisma.articleTag.deleteMany();
  await prisma.savedArticle.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();

  console.log("Cleared existing articles.");

  // ------------------------------------------------------------------
  // 2. Users — upsert with current credentials
  // ------------------------------------------------------------------
  // Credentials come from the environment. Fall back to obvious dev-only
  // placeholders locally so the seed still runs, but real/production
  // deployments MUST set these env vars.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "dev-admin-change-me";
  const editorPassword = process.env.SEED_EDITOR_PASSWORD ?? "dev-editor-change-me";
  const authorPassword = process.env.SEED_AUTHOR_PASSWORD ?? "dev-author-change-me";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const editorHash = await bcrypt.hash(editorPassword, 10);
  const authorHash = await bcrypt.hash(authorPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@theforexrepublic.com" },
    update: { passwordHash: adminHash, name: "TFR Admin", role: "ADMIN" },
    create: {
      email: "admin@theforexrepublic.com",
      passwordHash: adminHash,
      name: "TFR Admin",
      role: "ADMIN",
      authorProfile: {
        create: {
          slug: "tfr-admin",
          bio: "Editor-in-chief at The Forex Republic.",
          twitter: "@theforexrepublic",
        },
      },
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@theforexrepublic.com" },
    update: { passwordHash: editorHash, name: "TFR Editor", role: "EDITOR" },
    create: {
      email: "editor@theforexrepublic.com",
      passwordHash: editorHash,
      name: "TFR Editor",
      role: "EDITOR",
      authorProfile: {
        create: {
          slug: "tfr-editor",
          bio: "Senior markets reporter covering crypto and DeFi.",
          twitter: "@tfrmarkets",
        },
      },
    },
  });

  const author1 = await prisma.user.upsert({
    where: { email: "author@theforexrepublic.com" },
    update: { passwordHash: authorHash, name: "TFR Author", role: "AUTHOR" },
    create: {
      email: "author@theforexrepublic.com",
      passwordHash: authorHash,
      name: "TFR Author",
      role: "AUTHOR",
      authorProfile: {
        create: {
          slug: "tfr-author",
          bio: "FX and rates analyst covering G10 and emerging markets.",
        },
      },
    },
  });

  // ------------------------------------------------------------------
  // 3. Categories
  // ------------------------------------------------------------------
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "crypto" }, update: {}, create: { slug: "crypto", name: "Crypto", description: "Digital assets, DeFi, and blockchain", order: 1 } }),
    prisma.category.upsert({ where: { slug: "forex" }, update: {}, create: { slug: "forex", name: "Forex", description: "Currency markets and central bank policy", order: 2 } }),
    prisma.category.upsert({ where: { slug: "stocks" }, update: {}, create: { slug: "stocks", name: "Stocks", description: "Equities, IPOs, and corporate earnings", order: 3 } }),
    prisma.category.upsert({ where: { slug: "macro" }, update: {}, create: { slug: "macro", name: "Macro", description: "Global economics, rates, and fiscal policy", order: 4 } }),
    prisma.category.upsert({ where: { slug: "gold" }, update: {}, create: { slug: "gold", name: "Gold", description: "Gold markets, precious metals, and commodities", order: 5 } }),
    prisma.category.upsert({ where: { slug: "analysis" }, update: {}, create: { slug: "analysis", name: "Analysis", description: "Deep dives and research notes", order: 6 } }),
    prisma.category.upsert({ where: { slug: "opinion" }, update: {}, create: { slug: "opinion", name: "Opinion", description: "Commentary and editorials", order: 7 } }),
  ]);

  // ------------------------------------------------------------------
  // 4. Tags — expanded set for real articles
  // ------------------------------------------------------------------
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: "bitcoin" }, update: {}, create: { slug: "bitcoin", name: "Bitcoin" } }),
    prisma.tag.upsert({ where: { slug: "ethereum" }, update: {}, create: { slug: "ethereum", name: "Ethereum" } }),
    prisma.tag.upsert({ where: { slug: "defi" }, update: {}, create: { slug: "defi", name: "DeFi" } }),
    prisma.tag.upsert({ where: { slug: "fed" }, update: {}, create: { slug: "fed", name: "Federal Reserve" } }),
    prisma.tag.upsert({ where: { slug: "regulation" }, update: {}, create: { slug: "regulation", name: "Regulation" } }),
    prisma.tag.upsert({ where: { slug: "earnings" }, update: {}, create: { slug: "earnings", name: "Earnings" } }),
    prisma.tag.upsert({ where: { slug: "ai" }, update: {}, create: { slug: "ai", name: "AI" } }),
    prisma.tag.upsert({ where: { slug: "inflation" }, update: {}, create: { slug: "inflation", name: "Inflation" } }),
    prisma.tag.upsert({ where: { slug: "xrp" }, update: {}, create: { slug: "xrp", name: "XRP" } }),
    prisma.tag.upsert({ where: { slug: "meme-coins" }, update: {}, create: { slug: "meme-coins", name: "Meme Coins" } }),
    prisma.tag.upsert({ where: { slug: "stablecoins" }, update: {}, create: { slug: "stablecoins", name: "Stablecoins" } }),
    prisma.tag.upsert({ where: { slug: "tokenization" }, update: {}, create: { slug: "tokenization", name: "Tokenization" } }),
  ]);

  // ------------------------------------------------------------------
  // 5. Seed articles
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // 6. Article → Tag mappings
  // ------------------------------------------------------------------
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
  console.log("\nSeeded accounts (passwords come from SEED_*_PASSWORD env vars):");
  console.log("  Admin:  admin@theforexrepublic.com");
  console.log("  Editor: editor@theforexrepublic.com");
  console.log("  Author: author@theforexrepublic.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

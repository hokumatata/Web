import { newsArticles, articleTagMap, type AuthorKey } from "@/data/newsData";

export interface MockCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  order: number;
}

export interface MockTag {
  id: string;
  slug: string;
  name: string;
}

export interface MockAuthorProfile {
  id: string;
  userId: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  twitter: string | null;
}

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  authorProfile?: MockAuthorProfile | null;
}

export interface MockArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  status: string;
  dueDiligence: string | null;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: Date | null;
  authorId: string;
  categoryId: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface MockComment {
  id: string;
  articleId: string;
  userId: string;
  body: string;
  status: string;
  createdAt: Date;
}

export interface MockSavedArticle {
  userId: string;
  articleId: string;
  createdAt: Date;
}

export interface MockWatchlist {
  id: string;
  userId: string;
  symbol: string;
  type: string;
}

export interface MockUserPreferences {
  userId: string;
  topicsJson: string;
  emailDigest: boolean;
  theme: string;
}

export interface MockNewsletterSubscriber {
  id: string;
  email: string;
  createdAt: Date;
  confirmedAt: Date | null;
}

export interface MockAuditLog {
  id: string;
  actorId: string | null;
  action: string;
  target: string | null;
  meta: string | null;
  createdAt: Date;
}

const CATEGORY_IMAGES: Record<string, string> = {
  crypto: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&auto=format&fit=crop&q=80",
  forex: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
  stocks: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80",
  macro: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
  gold: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop&q=80",
  analysis: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1200&auto=format&fit=crop&q=80",
  opinion: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80",
};

export class MockPrismaStore {
  categories: MockCategory[] = [
    { id: "cat-crypto", slug: "crypto", name: "Crypto", description: "Digital assets, DeFi, and blockchain", order: 1 },
    { id: "cat-forex", slug: "forex", name: "Forex", description: "Currency markets and central bank policy", order: 2 },
    { id: "cat-stocks", slug: "stocks", name: "Stocks", description: "Equities, IPOs, and corporate earnings", order: 3 },
    { id: "cat-macro", slug: "macro", name: "Macro", description: "Global economics, rates, and fiscal policy", order: 4 },
    { id: "cat-gold", slug: "gold", name: "Gold", description: "Gold markets, precious metals, and commodities", order: 5 },
    { id: "cat-analysis", slug: "analysis", name: "Analysis", description: "Deep dives and research notes", order: 6 },
    { id: "cat-opinion", slug: "opinion", name: "Opinion", description: "Commentary and editorials", order: 7 },
  ];

  tags: MockTag[] = [
    { id: "tag-bitcoin", slug: "bitcoin", name: "Bitcoin" },
    { id: "tag-ethereum", slug: "ethereum", name: "Ethereum" },
    { id: "tag-defi", slug: "defi", name: "DeFi" },
    { id: "tag-fed", slug: "fed", name: "Federal Reserve" },
    { id: "tag-regulation", slug: "regulation", name: "Regulation" },
    { id: "tag-earnings", slug: "earnings", name: "Earnings" },
    { id: "tag-ai", slug: "ai", name: "AI" },
    { id: "tag-inflation", slug: "inflation", name: "Inflation" },
    { id: "tag-xrp", slug: "xrp", name: "XRP" },
    { id: "tag-meme-coins", slug: "meme-coins", name: "Meme Coins" },
    { id: "tag-stablecoins", slug: "stablecoins", name: "Stablecoins" },
    { id: "tag-tokenization", slug: "tokenization", name: "Tokenization" },
  ];

  users: MockUser[] = [
    {
      id: "user-admin",
      email: "masteruser@theforexrepublic.com",
      passwordHash: "$2a$10$wE1V2u3Y4z5A6B7C8D9E0e1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6",
      name: "TFR Admin",
      role: "ADMIN",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      authorProfile: {
        id: "prof-admin",
        userId: "user-admin",
        slug: "tfr-admin",
        bio: "Editor-in-chief at The Forex Republic.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        twitter: "@theforexrepublic",
      },
    },
    {
      id: "user-editor",
      email: "editorial@theforexrepublic.com",
      passwordHash: "$2a$10$wE1V2u3Y4z5A6B7C8D9E0e1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6",
      name: "TFR Editor",
      role: "EDITOR",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      authorProfile: {
        id: "prof-editor",
        userId: "user-editor",
        slug: "tfr-editor",
        bio: "Senior markets reporter covering crypto and DeFi.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        twitter: "@tfrmarkets",
      },
    },
    {
      id: "user-author",
      email: "writer@theforexrepublic.com",
      passwordHash: "$2a$10$wE1V2u3Y4z5A6B7C8D9E0e1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6",
      name: "TFR Author",
      role: "AUTHOR",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      authorProfile: {
        id: "prof-author",
        userId: "user-author",
        slug: "tfr-author",
        bio: "FX and rates analyst covering G10 and emerging markets.",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        twitter: null,
      },
    },
  ];

  articles: MockArticle[] = [];
  comments: MockComment[] = [];
  savedArticles: MockSavedArticle[] = [];
  watchlist: MockWatchlist[] = [];
  preferences: MockUserPreferences[] = [];
  subscribers: MockNewsletterSubscriber[] = [];
  auditLogs: MockAuditLog[] = [];
  events: any[] = [];
  tickerConfigs: any[] = [];
  newsletterIssues: any[] = [];

  constructor() {
    this.initArticles();
  }

  private initArticles() {
    const now = Date.now();
    const authorMap: Record<AuthorKey, string> = {
      admin: "user-admin",
      editor: "user-editor",
      author1: "user-author",
    };

    this.articles = newsArticles.map((raw, idx) => {
      const cat = this.categories.find((c) => c.slug === raw.categorySlug) || this.categories[0];
      const authorId = authorMap[raw.authorKey] || "user-editor";
      const tags = articleTagMap[raw.slug] || [];
      const cover = raw.coverImageUrl && raw.coverImageUrl.length > 0
        ? raw.coverImageUrl
        : CATEGORY_IMAGES[raw.categorySlug] || CATEGORY_IMAGES.crypto;

      return {
        id: `art-${idx + 1}`,
        slug: raw.slug,
        title: raw.title,
        excerpt: raw.excerpt,
        body: raw.body,
        coverImageUrl: cover,
        thumbnailUrl: cover,
        status: raw.status,
        dueDiligence: null,
        isFeatured: raw.isFeatured ?? (idx < 2),
        isBreaking: raw.isBreaking ?? false,
        publishedAt: new Date(now - raw.publishedAgoMs),
        authorId,
        categoryId: cat.id,
        views: 120 + (idx * 37) % 850,
        createdAt: new Date(now - raw.publishedAgoMs - 3600000),
        updatedAt: new Date(now - raw.publishedAgoMs),
        tags,
      };
    });
  }

  enrichArticle(art: MockArticle, include?: any) {
    const enriched: any = { ...art };
    if (include?.category) {
      const cat = this.categories.find((c) => c.id === art.categoryId);
      enriched.category = cat ? { id: cat.id, slug: cat.slug, name: cat.name } : { slug: "markets", name: "Markets" };
    }
    if (include?.author) {
      const user = this.users.find((u) => u.id === art.authorId);
      enriched.author = {
        name: user?.name ?? "Editorial Staff",
        authorProfile: user?.authorProfile
          ? {
              slug: user.authorProfile.slug,
              bio: user.authorProfile.bio,
              avatarUrl: user.authorProfile.avatarUrl,
            }
          : null,
      };
    }
    if (include?.tags) {
      const tagSlugs = art.tags || [];
      enriched.tags = tagSlugs.map((ts) => {
        const t = this.tags.find((tag) => tag.slug === ts);
        return {
          articleId: art.id,
          tagId: t?.id ?? ts,
          tag: t ?? { id: ts, slug: ts, name: ts },
        };
      });
    }
    if (include?.comments) {
      const comms = this.comments
        .filter((c) => c.articleId === art.id && (c.status === "APPROVED" || !c.status))
        .map((c) => {
          const u = this.users.find((user) => user.id === c.userId);
          return {
            id: c.id,
            body: c.body,
            status: c.status,
            createdAt: c.createdAt,
            user: { name: u?.name ?? "Reader" },
          };
        });
      enriched.comments = comms;
    }
    return enriched;
  }
}

export function createMockPrismaClient(store: MockPrismaStore): any {
  return {
    $disconnect: async () => {},
    $connect: async () => {},

    article: {
      findMany: async (args: any = {}) => {
        let results = [...store.articles];

        if (args.where) {
          const w = args.where;
          if (w.status) {
            results = results.filter((a) => a.status === w.status);
          }
          if (typeof w.isFeatured === "boolean") {
            results = results.filter((a) => a.isFeatured === w.isFeatured);
          }
          if (typeof w.isBreaking === "boolean") {
            results = results.filter((a) => a.isBreaking === w.isBreaking);
          }
          if (w.categoryId) {
            results = results.filter((a) => a.categoryId === w.categoryId);
          }
          if (w.category?.slug) {
            const cat = store.categories.find((c) => c.slug === w.category.slug);
            results = results.filter((a) => a.categoryId === cat?.id);
          }
          if (w.authorId) {
            results = results.filter((a) => a.authorId === w.authorId);
          }
          if (w.tags?.some?.tag?.slug) {
            const tagSlug = w.tags.some.tag.slug;
            results = results.filter((a) => (a.tags || []).includes(tagSlug));
          }
          if (w.id?.in && Array.isArray(w.id.in)) {
            results = results.filter((a) => w.id.in.includes(a.id));
          }
          if (w.OR && Array.isArray(w.OR)) {
            results = results.filter((a) =>
              w.OR.some((cond: any) => {
                if (cond.title?.contains) {
                  return a.title.toLowerCase().includes(cond.title.contains.toLowerCase());
                }
                if (cond.excerpt?.contains) {
                  return a.excerpt.toLowerCase().includes(cond.excerpt.contains.toLowerCase());
                }
                if (cond.body?.contains) {
                  return a.body.toLowerCase().includes(cond.body.contains.toLowerCase());
                }
                return false;
              })
            );
          }
        }

        // Sorting
        if (args.orderBy) {
          const ob = Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy;
          if (ob.publishedAt === "desc") {
            results.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
          } else if (ob.publishedAt === "asc") {
            results.sort((a, b) => (a.publishedAt?.getTime() ?? 0) - (b.publishedAt?.getTime() ?? 0));
          } else if (ob.views === "desc") {
            results.sort((a, b) => b.views - a.views);
          } else if (ob.createdAt === "desc") {
            results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
        } else {
          results.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
        }

        if (args.skip && args.skip > 0) {
          results = results.slice(args.skip);
        }
        if (args.take && args.take > 0) {
          results = results.slice(0, args.take);
        }

        return results.map((a) => store.enrichArticle(a, args.include));
      },

      findUnique: async (args: any = {}) => {
        let art: MockArticle | undefined;
        if (args.where?.slug) {
          art = store.articles.find((a) => a.slug === args.where.slug);
        } else if (args.where?.id) {
          art = store.articles.find((a) => a.id === args.where.id);
        }
        if (!art) return null;
        if (args.where?.status && art.status !== args.where.status) {
          return null;
        }
        return store.enrichArticle(art, args.include);
      },

      count: async (args: any = {}) => {
        let count = store.articles.length;
        if (args.where?.status) {
          count = store.articles.filter((a) => a.status === args.where.status).length;
        }
        return count;
      },

      aggregate: async () => {
        const totalViews = store.articles.reduce((acc, a) => acc + (a.views || 0), 0);
        return {
          _sum: { views: totalViews },
        };
      },

      create: async (args: any) => {
        const d = args.data || {};
        const newArt: MockArticle = {
          id: `art-${Date.now()}`,
          slug: d.slug || `article-${Date.now()}`,
          title: d.title || "Untitled Article",
          excerpt: d.excerpt || "",
          body: d.body || "",
          coverImageUrl: d.coverImageUrl || CATEGORY_IMAGES.crypto,
          thumbnailUrl: d.coverImageUrl || CATEGORY_IMAGES.crypto,
          status: d.status || "DRAFT",
          dueDiligence: d.dueDiligence || null,
          isFeatured: d.isFeatured ?? false,
          isBreaking: d.isBreaking ?? false,
          publishedAt: d.publishedAt ? new Date(d.publishedAt) : new Date(),
          authorId: d.authorId || "user-admin",
          categoryId: d.categoryId || store.categories[0].id,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
        };
        store.articles.unshift(newArt);
        return store.enrichArticle(newArt, args.include);
      },

      update: async (args: any) => {
        let art = store.articles.find((a) => (args.where?.id && a.id === args.where.id) || (args.where?.slug && a.slug === args.where.slug));
        if (!art) return null;
        const d = args.data || {};
        if (d.views?.increment) {
          art.views = (art.views || 0) + d.views.increment;
        } else if (typeof d.views === "number") {
          art.views = d.views;
        }
        if (d.title !== undefined) art.title = d.title;
        if (d.excerpt !== undefined) art.excerpt = d.excerpt;
        if (d.body !== undefined) art.body = d.body;
        if (d.coverImageUrl !== undefined) art.coverImageUrl = d.coverImageUrl;
        if (d.status !== undefined) art.status = d.status;
        if (d.isFeatured !== undefined) art.isFeatured = d.isFeatured;
        if (d.isBreaking !== undefined) art.isBreaking = d.isBreaking;
        art.updatedAt = new Date();
        return store.enrichArticle(art, args.include);
      },

      delete: async (args: any) => {
        const idx = store.articles.findIndex((a) => (args.where?.id && a.id === args.where.id) || (args.where?.slug && a.slug === args.where.slug));
        if (idx >= 0) {
          const [removed] = store.articles.splice(idx, 1);
          return removed;
        }
        return {};
      },

      deleteMany: async () => ({ count: 0 }),
    },

    category: {
      findMany: async () => [...store.categories],
      findUnique: async (args: any) => {
        if (args.where?.slug) return store.categories.find((c) => c.slug === args.where.slug) || null;
        if (args.where?.id) return store.categories.find((c) => c.id === args.where.id) || null;
        return null;
      },
      count: async () => store.categories.length,
      upsert: async (args: any) => {
        const existing = store.categories.find((c) => c.slug === args.where?.slug);
        if (existing) return existing;
        const cat = { id: `cat-${Date.now()}`, ...args.create };
        store.categories.push(cat);
        return cat;
      },
      create: async (args: any) => {
        const cat = { id: `cat-${Date.now()}`, ...args.data };
        store.categories.push(cat);
        return cat;
      },
    },

    tag: {
      findMany: async () => [...store.tags],
      findUnique: async (args: any) => {
        if (args.where?.slug) return store.tags.find((t) => t.slug === args.where.slug) || null;
        if (args.where?.id) return store.tags.find((t) => t.id === args.where.id) || null;
        return null;
      },
      upsert: async (args: any) => {
        const existing = store.tags.find((t) => t.slug === args.where?.slug);
        if (existing) return existing;
        const tag = { id: `tag-${Date.now()}`, ...args.create };
        store.tags.push(tag);
        return tag;
      },
      create: async (args: any) => {
        const tag = { id: `tag-${Date.now()}`, ...args.data };
        store.tags.push(tag);
        return tag;
      },
    },

    articleTag: {
      deleteMany: async () => ({ count: 0 }),
      upsert: async () => ({}),
      create: async () => ({}),
    },

    user: {
      findMany: async () => [...store.users],
      findUnique: async (args: any) => {
        if (args.where?.email) return store.users.find((u) => u.email === args.where.email) || null;
        if (args.where?.id) return store.users.find((u) => u.id === args.where.id) || null;
        return null;
      },
      count: async () => store.users.length,
      create: async (args: any) => {
        const d = args.data || {};
        const u: MockUser = {
          id: `user-${Date.now()}`,
          email: d.email,
          passwordHash: d.passwordHash || "",
          name: d.name || "Reader",
          role: d.role || "READER",
          createdAt: new Date(),
          updatedAt: new Date(),
          authorProfile: d.authorProfile?.create
            ? {
                id: `prof-${Date.now()}`,
                userId: `user-${Date.now()}`,
                slug: d.authorProfile.create.slug || `user-${Date.now()}`,
                bio: d.authorProfile.create.bio || null,
                avatarUrl: null,
                twitter: d.authorProfile.create.twitter || null,
              }
            : null,
        };
        store.users.push(u);
        return u;
      },
      update: async (args: any) => {
        const u = store.users.find((usr) => (args.where?.id && usr.id === args.where.id) || (args.where?.email && usr.email === args.where.email));
        if (!u) return null;
        Object.assign(u, args.data);
        return u;
      },
      upsert: async (args: any) => {
        const existing = store.users.find((u) => u.email === args.where?.email);
        if (existing) return existing;
        const d = args.create || {};
        const u: MockUser = {
          id: `user-${Date.now()}`,
          email: d.email,
          passwordHash: d.passwordHash || "",
          name: d.name || "Reader",
          role: d.role || "READER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.users.push(u);
        return u;
      },
    },

    authorProfile: {
      findUnique: async (args: any) => {
        const prof = store.users.find((u) => (args.where?.slug && u.authorProfile?.slug === args.where.slug) || (args.where?.userId && u.id === args.where.userId));
        return prof?.authorProfile || null;
      },
    },

    comment: {
      findMany: async (args: any = {}) => {
        let comms = [...store.comments];
        if (args.where?.articleId) {
          comms = comms.filter((c) => c.articleId === args.where.articleId);
        }
        if (args.where?.status) {
          comms = comms.filter((c) => c.status === args.where.status);
        }
        return comms.map((c) => {
          const user = store.users.find((u) => u.id === c.userId);
          return {
            ...c,
            user: { name: user?.name ?? "Reader" },
          };
        });
      },
      create: async (args: any) => {
        const d = args.data || {};
        const c: MockComment = {
          id: `comm-${Date.now()}`,
          articleId: d.articleId,
          userId: d.userId,
          body: d.body,
          status: d.status || "APPROVED",
          createdAt: new Date(),
        };
        store.comments.unshift(c);
        const user = store.users.find((u) => u.id === c.userId);
        return { ...c, user: { name: user?.name ?? "Reader" } };
      },
      update: async (args: any) => {
        const c = store.comments.find((cm) => cm.id === args.where?.id);
        if (c) Object.assign(c, args.data);
        return c;
      },
      delete: async (args: any) => {
        const idx = store.comments.findIndex((cm) => cm.id === args.where?.id);
        if (idx >= 0) return store.comments.splice(idx, 1)[0];
        return {};
      },
      count: async () => store.comments.length,
      deleteMany: async () => ({ count: 0 }),
    },

    savedArticle: {
      findMany: async (args: any = {}) => {
        let saved = [...store.savedArticles];
        if (args.where?.userId) saved = saved.filter((s) => s.userId === args.where.userId);
        return saved.map((s) => {
          const art = store.articles.find((a) => a.id === s.articleId);
          return {
            ...s,
            article: art ? store.enrichArticle(art, args.include?.article?.include) : null,
          };
        });
      },
      create: async (args: any) => {
        const d = args.data || {};
        const s: MockSavedArticle = { userId: d.userId, articleId: d.articleId, createdAt: new Date() };
        store.savedArticles.push(s);
        return s;
      },
      delete: async (args: any) => {
        const idx = store.savedArticles.findIndex((s) => s.userId === args.where?.userId_articleId?.userId && s.articleId === args.where?.userId_articleId?.articleId);
        if (idx >= 0) return store.savedArticles.splice(idx, 1)[0];
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
      count: async () => store.savedArticles.length,
    },

    watchlist: {
      findMany: async (args: any = {}) => {
        let items = [...store.watchlist];
        if (args.where?.userId) items = items.filter((w) => w.userId === args.where.userId);
        return items;
      },
      create: async (args: any) => {
        const d = args.data || {};
        const item: MockWatchlist = { id: `wl-${Date.now()}`, userId: d.userId, symbol: d.symbol, type: d.type };
        store.watchlist.push(item);
        return item;
      },
      delete: async (args: any) => {
        const idx = store.watchlist.findIndex((w) => w.id === args.where?.id || (w.userId === args.where?.userId_symbol_type?.userId && w.symbol === args.where?.userId_symbol_type?.symbol));
        if (idx >= 0) return store.watchlist.splice(idx, 1)[0];
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
      count: async () => store.watchlist.length,
    },

    userPreferences: {
      findUnique: async (args: any) => {
        return store.preferences.find((p) => p.userId === args.where?.userId) || null;
      },
      upsert: async (args: any) => {
        let p = store.preferences.find((pref) => pref.userId === args.where?.userId);
        if (p) {
          Object.assign(p, args.update);
          return p;
        }
        const created: MockUserPreferences = {
          userId: args.where?.userId || "anonymous",
          topicsJson: args.create?.topicsJson || "[]",
          emailDigest: args.create?.emailDigest ?? false,
          theme: args.create?.theme || "dark",
        };
        store.preferences.push(created);
        return created;
      },
    },

    tickerConfig: {
      findMany: async () => store.tickerConfigs,
      create: async (args: any) => {
        store.tickerConfigs.push(args.data);
        return args.data;
      },
    },

    newsletterSubscriber: {
      findMany: async () => store.subscribers,
      findUnique: async (args: any) => store.subscribers.find((s) => s.email === args.where?.email) || null,
      create: async (args: any) => {
        const sub = { id: `sub-${Date.now()}`, email: args.data.email, createdAt: new Date(), confirmedAt: null };
        store.subscribers.push(sub);
        return sub;
      },
      count: async () => store.subscribers.length,
    },

    newsletterIssue: {
      findMany: async () => store.newsletterIssues,
      findUnique: async (args: any) => store.newsletterIssues.find((i) => i.slug === args.where?.slug) || null,
      create: async (args: any) => {
        store.newsletterIssues.push(args.data);
        return args.data;
      },
      update: async (args: any) => args.data,
    },

    auditLog: {
      findMany: async () => store.auditLogs,
      create: async (args: any) => {
        const log = { id: `log-${Date.now()}`, createdAt: new Date(), ...args.data };
        store.auditLogs.unshift(log);
        return log;
      },
    },

    sourceItem: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (args: any) => args.data,
    },

    economicEvent: {
      findMany: async () => store.events,
      upsert: async (args: any) => args.create,
    },
  };
}

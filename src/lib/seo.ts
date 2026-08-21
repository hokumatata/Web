export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "The Forex Republic";

const FALLBACK_SITE_URL = "https://www.theforexrepublic.com";

/**
 * Canonical production origin: absolute www, no trailing slash.
 * Set NEXT_PUBLIC_SITE_URL=https://www.theforexrepublic.com in Vercel (Production).
 * Apex hosts are rewritten to www so canonicals match the live URL.
 */
export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

function resolveSiteUrl(raw: string | undefined): string {
  const trimmed = (raw ?? FALLBACK_SITE_URL).trim().replace(/\/+$/, "");
  try {
    const url = new URL(trimmed);
    if (url.hostname === "theforexrepublic.com") {
      url.hostname = "www.theforexrepublic.com";
    }
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function absUrl(path: string): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  const suffix = (path.startsWith("/") ? path : `/${path}`).replace(/\/+$/, "");
  return `${SITE_URL}${suffix}`;
}

/** Absolute URL for Open Graph / schema images (pass-through if already absolute). */
export function absImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return absUrl(url);
}


interface ArticleSchemaInput {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
  authorSlug?: string | null;
  categoryName: string;
  section?: string;
}

export function newsArticleSchema(a: ArticleSchemaInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.excerpt,
    image: (() => {
      const img = absImageUrl(a.coverImageUrl);
      return img ? [img] : undefined;
    })(),
    datePublished: a.publishedAt?.toISOString(),
    dateModified: (a.updatedAt ?? a.publishedAt)?.toISOString(),
    articleSection: a.section ?? a.categoryName,
    mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(`/article/${a.slug}`) },
    author: a.authorName
      ? {
          "@type": "Person",
          name: a.authorName,
          url: a.authorSlug ? absUrl(`/author/${a.authorSlug}`) : undefined,
        }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absUrl("/icon.png") },
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/icon.png"),
    description:
      "Live markets data, crypto and forex news, deep analysis, and macro coverage for traders and professionals.",
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

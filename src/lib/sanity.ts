import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-06-01",
  useCdn: process.env.NODE_ENV === "production",
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// --- GROQ Queries ---

const ARTICLE_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body,
  coverImage,
  publishedAt,
  isBreaking,
  isFeatured,
  status,
  category->{name, "slug": slug.current},
  author->{name, "slug": slug.current, avatar, role},
  tags[]->{name, "slug": slug.current}
`;

export const queries = {
  latestArticles: /* groq */ `
    *[_type == "article" && status == "published"] | order(publishedAt desc)[0...20] {
      ${ARTICLE_FIELDS}
    }
  `,

  featuredArticles: /* groq */ `
    *[_type == "article" && status == "published" && isFeatured == true] | order(publishedAt desc)[0...5] {
      ${ARTICLE_FIELDS}
    }
  `,

  categoryArticles: /* groq */ `
    *[_type == "article" && status == "published" && category->slug.current == $slug] | order(publishedAt desc)[0...5] {
      ${ARTICLE_FIELDS}
    }
  `,

  articleBySlug: /* groq */ `
    *[_type == "article" && slug.current == $slug][0] {
      ${ARTICLE_FIELDS},
      seoTitle,
      seoDescription
    }
  `,

  allCategories: /* groq */ `
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description
    }
  `,

  authorBySlug: /* groq */ `
    *[_type == "author" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      avatar,
      bio,
      role,
      twitter,
      linkedin
    }
  `,

  authorArticles: /* groq */ `
    *[_type == "article" && status == "published" && author->slug.current == $slug] | order(publishedAt desc)[0...20] {
      ${ARTICLE_FIELDS}
    }
  `,

  breakingArticles: /* groq */ `
    *[_type == "article" && status == "published" && isBreaking == true] | order(publishedAt desc)[0...10] {
      ${ARTICLE_FIELDS}
    }
  `,

  articleCount: /* groq */ `
    count(*[_type == "article" && status == "published"])
  `,

  sitemapArticles: /* groq */ `
    *[_type == "article" && status == "published"] | order(publishedAt desc) {
      "slug": slug.current,
      publishedAt,
      _updatedAt
    }
  `,
};

// --- Typed fetch helper ---

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  return sanityClient.fetch<T>(query, params);
}

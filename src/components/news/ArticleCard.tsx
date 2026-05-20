import Link from "next/link";
import { timeAgo, readTime } from "@/lib/utils";

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | string | null;
  body: string;
  isBreaking?: boolean;
  category: { slug: string; name: string };
  author: { name: string; authorProfile: { slug: string } | null } | null;
}

export function HeroLead({ a }: { a: ArticleCardData }) {
  return (
    <article className="card overflow-hidden group">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/9] w-full overflow-hidden bg-ink-800">
        {a.coverImageUrl && (
          <img
            src={a.coverImageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2">
          {a.isBreaking && <span className="badge-accent">Breaking</span>}
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
            {a.category.name}
          </Link>
          <span className="text-2xs text-ink-300">· {timeAgo(a.publishedAt)} · {readTime(a.body)} min read</span>
        </div>
        <h2 className="mt-2 font-serif text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
          <Link href={`/article/${a.slug}`} className="hover:text-accent">{a.title}</Link>
        </h2>
        <p className="mt-3 text-ink-200 text-sm md:text-base text-pretty">{a.excerpt}</p>
        {a.author && (
          <p className="mt-3 text-xs text-ink-300">By {a.author.name}</p>
        )}
      </div>
    </article>
  );
}

export function ArticleCard({ a, variant = "default" }: { a: ArticleCardData; variant?: "default" | "compact" | "image-left" }) {
  if (variant === "compact") {
    return (
      <div className="border-b border-ink-700 py-3 last:border-b-0">
        <div className="flex items-center gap-2">
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
            {a.category.name}
          </Link>
          <span className="text-2xs text-ink-300">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="mt-1 font-serif text-base font-semibold text-ink-100 leading-snug">
          <Link href={`/article/${a.slug}`} className="hover:text-accent">{a.title}</Link>
        </h3>
      </div>
    );
  }
  if (variant === "image-left") {
    return (
      <div className="flex gap-3 border-b border-ink-700 py-3 last:border-b-0 group">
        <Link href={`/article/${a.slug}`} className="h-20 w-28 flex-shrink-0 overflow-hidden bg-ink-800">
          {a.coverImageUrl && (
            <img src={a.coverImageUrl} alt={a.title} className="h-full w-full object-cover" />
          )}
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name}</Link>
            <span className="text-2xs text-ink-300">{timeAgo(a.publishedAt)}</span>
          </div>
          <h3 className="mt-1 font-serif text-base font-semibold text-ink-100 leading-snug line-clamp-3">
            <Link href={`/article/${a.slug}`} className="hover:text-accent">{a.title}</Link>
          </h3>
        </div>
      </div>
    );
  }
  return (
    <article className="card overflow-hidden h-full flex flex-col group">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/10] w-full overflow-hidden bg-ink-800">
        {a.coverImageUrl && (
          <img
            src={a.coverImageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name}</Link>
          <span className="text-2xs text-ink-300">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="mt-1.5 font-serif text-lg font-semibold text-white leading-snug tracking-tight">
          <Link href={`/article/${a.slug}`} className="hover:text-accent">{a.title}</Link>
        </h3>
        <p className="mt-2 text-sm text-ink-300 line-clamp-2">{a.excerpt}</p>
      </div>
    </article>
  );
}

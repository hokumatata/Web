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
    <article className="card overflow-hidden group relative">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/9] w-full overflow-hidden bg-ink-800 relative">
        {a.coverImageUrl && (
          <img
            src={a.coverImageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            {a.isBreaking && (
              <span className="badge-accent flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-down opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 bg-down" />
                </span>
                LIVE
              </span>
            )}
            <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
              {a.category.name.toUpperCase()}
            </Link>
            <span className="text-3xs text-ink-400 tracking-wider">
              {timeAgo(a.publishedAt)}
            </span>
          </div>
          <h2 className="font-serif text-xl md:text-3xl font-bold text-white leading-tight tracking-tight text-balance">
            <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
          </h2>
          <p className="mt-2 text-ink-200 text-xs md:text-sm text-pretty max-w-2xl line-clamp-2">{a.excerpt}</p>
          {a.author && (
            <p className="mt-2 text-3xs text-ink-500 uppercase tracking-widest">{a.author.name} | {readTime(a.body)} MIN READ</p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ArticleCard({ a, variant = "default" }: { a: ArticleCardData; variant?: "default" | "compact" | "image-left" | "headline-only" }) {
  if (variant === "headline-only") {
    return (
      <div className="border-b border-ink-700 py-2.5 last:border-b-0 group">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
                {a.category.name.toUpperCase()}
              </Link>
              <span className="text-3xs text-ink-500 tracking-wider">{timeAgo(a.publishedAt)}</span>
            </div>
            <h3 className="text-xs font-semibold text-ink-100 leading-snug">
              <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="border-b border-ink-700 py-2.5 last:border-b-0">
        <div className="flex items-center gap-2">
          {a.isBreaking && <span className="badge-down text-[8px] py-0">LIVE</span>}
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
            {a.category.name.toUpperCase()}
          </Link>
          <span className="text-3xs text-ink-500 tracking-wider">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="mt-0.5 text-xs font-semibold text-ink-100 leading-snug">
          <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
        </h3>
      </div>
    );
  }

  if (variant === "image-left") {
    return (
      <div className="flex gap-3 border-b border-ink-700 py-2.5 last:border-b-0 group">
        <Link href={`/article/${a.slug}`} className="h-16 w-24 flex-shrink-0 overflow-hidden bg-ink-800">
          {a.coverImageUrl && (
            <img src={a.coverImageUrl} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name.toUpperCase()}</Link>
            <span className="text-3xs text-ink-500 tracking-wider">{timeAgo(a.publishedAt)}</span>
          </div>
          <h3 className="mt-0.5 text-xs font-semibold text-ink-100 leading-snug line-clamp-2">
            <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
          </h3>
        </div>
      </div>
    );
  }

  return (
    <article className="card-hover overflow-hidden h-full flex flex-col group border border-ink-700">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/10] w-full overflow-hidden bg-ink-800 relative">
        {a.coverImageUrl && (
          <img
            src={a.coverImageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        )}
        {a.isBreaking && (
          <span className="absolute top-2 left-2 badge-down text-[8px] flex items-center gap-1">
            <span className="relative flex h-1 w-1">
              <span className="absolute inline-flex h-full w-full animate-ping bg-down opacity-70" />
              <span className="relative inline-flex h-1 w-1 bg-down" />
            </span>
            LIVE
          </span>
        )}
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name.toUpperCase()}</Link>
          <span className="text-3xs text-ink-500 tracking-wider">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="mt-1 text-xs font-semibold text-white leading-snug tracking-tight">
          <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
        </h3>
        <p className="mt-1.5 text-2xs text-ink-300 line-clamp-2 flex-1">{a.excerpt}</p>
        {a.author && (
          <p className="mt-2 text-3xs text-ink-500 uppercase tracking-widest">{a.author.name} | {readTime(a.body)} MIN</p>
        )}
      </div>
    </article>
  );
}

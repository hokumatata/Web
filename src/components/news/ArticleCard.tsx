import Link from "next/link";
import { timeAgo, readTime } from "@/lib/utils";
import { Clock, ArrowUpRight } from "lucide-react";

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
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            {a.isBreaking && (
              <span className="badge-accent flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Breaking
              </span>
            )}
            <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
              {a.category.name}
            </Link>
            <span className="text-2xs text-ink-300 flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(a.publishedAt)}
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight text-balance">
            <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
          </h2>
          <p className="mt-3 text-ink-200 text-sm md:text-base text-pretty max-w-2xl line-clamp-2">{a.excerpt}</p>
          {a.author && (
            <p className="mt-3 text-2xs text-ink-400 uppercase tracking-wider">By {a.author.name} &middot; {readTime(a.body)} min read</p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ArticleCard({ a, variant = "default" }: { a: ArticleCardData; variant?: "default" | "compact" | "image-left" | "headline-only" }) {
  if (variant === "headline-only") {
    return (
      <div className="border-b border-ink-800/50 py-3 last:border-b-0 group">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
                {a.category.name}
              </Link>
              <span className="text-2xs text-ink-500">{timeAgo(a.publishedAt)}</span>
            </div>
            <h3 className="font-serif text-[15px] font-semibold text-ink-100 leading-snug">
              <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
            </h3>
          </div>
          <Link href={`/article/${a.slug}`} className="text-ink-500 group-hover:text-accent transition-colors mt-1 flex-shrink-0">
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="border-b border-ink-700 py-3 last:border-b-0">
        <div className="flex items-center gap-2">
          {a.isBreaking && <span className="badge-accent text-[9px] py-0">Live</span>}
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
            {a.category.name}
          </Link>
          <span className="text-2xs text-ink-400">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="mt-1 font-serif text-base font-semibold text-ink-100 leading-snug">
          <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
        </h3>
      </div>
    );
  }

  if (variant === "image-left") {
    return (
      <div className="flex gap-3 border-b border-ink-800/50 py-3 last:border-b-0 group">
        <Link href={`/article/${a.slug}`} className="h-20 w-28 flex-shrink-0 overflow-hidden bg-ink-800 rounded-sm">
          {a.coverImageUrl && (
            <img src={a.coverImageUrl} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name}</Link>
            <span className="text-2xs text-ink-500">{timeAgo(a.publishedAt)}</span>
          </div>
          <h3 className="mt-1 font-serif text-[15px] font-semibold text-ink-100 leading-snug line-clamp-2">
            <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
          </h3>
        </div>
      </div>
    );
  }

  return (
    <article className="card-hover overflow-hidden h-full flex flex-col group">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/10] w-full overflow-hidden bg-ink-800 relative">
        {a.coverImageUrl && (
          <img
            src={a.coverImageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        )}
        {a.isBreaking && (
          <span className="absolute top-3 left-3 badge-accent text-[9px] flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Breaking
          </span>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name}</Link>
          <span className="text-2xs text-ink-500">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="mt-1.5 font-serif text-lg font-semibold text-white leading-snug tracking-tight">
          <Link href={`/article/${a.slug}`} className="hover:text-accent transition-colors">{a.title}</Link>
        </h3>
        <p className="mt-2 text-sm text-ink-300 line-clamp-2 flex-1">{a.excerpt}</p>
        {a.author && (
          <p className="mt-3 text-2xs text-ink-400">{a.author.name} &middot; {readTime(a.body)} min</p>
        )}
      </div>
    </article>
  );
}

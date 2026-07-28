import Link from "next/link";
import { timeAgo, readTime } from "@/lib/utils";
import { Clock, Zap } from "lucide-react";

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  thumbnailUrl?: string | null;
  publishedAt: Date | string | null;
  body: string;
  isBreaking?: boolean;
  category: { slug: string; name: string };
  author: { name: string; authorProfile: { slug: string } | null } | null;
}

export function HeroLead({ a }: { a: ArticleCardData }) {
  return (
    <article className="relative overflow-hidden rounded-md group">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/9] md:aspect-[2/1] w-full overflow-hidden bg-ink-800 relative">
        {a.coverImageUrl && (
          <img
            src={a.coverImageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </Link>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          {a.isBreaking && (
            <span className="inline-flex items-center gap-1.5 bg-down/90 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
              <Zap size={9} className="fill-white" />
              Breaking
            </span>
          )}
          <Link href={`/category/${a.category.slug}`} className="pointer-events-auto text-[11px] uppercase font-bold tracking-wider text-accent hover:underline">
            {a.category.name}
          </Link>
        </div>
        <h2 className="font-serif text-2xl md:text-4xl font-bold text-white leading-[1.15] tracking-tight text-balance">
          <Link href={`/article/${a.slug}`} className="pointer-events-auto hover:underline decoration-2 underline-offset-4">{a.title}</Link>
        </h2>
        <p className="mt-3 text-white/80 text-sm md:text-base text-pretty max-w-2xl line-clamp-2 leading-relaxed">{a.excerpt}</p>
        <div className="mt-4 flex items-center gap-3 text-white/60 text-xs">
          {a.author && <span className="font-medium">{a.author.name}</span>}
          <span className="flex items-center gap-1"><Clock size={11} /> {readTime(a.body)} min read</span>
          <span>{timeAgo(a.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ a, variant = "default" }: { a: ArticleCardData; variant?: "default" | "compact" | "image-left" | "headline-only" }) {
  if (variant === "headline-only") {
    return (
      <div className="py-3 border-b border-ink-800 last:border-b-0 group">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
            {a.category.name}
          </Link>
          <span className="text-xs text-ink-500">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-semibold text-ink-100 leading-snug group-hover:text-accent transition-colors">
          <Link href={`/article/${a.slug}`}>{a.title}</Link>
        </h3>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="py-3 border-b border-ink-800 last:border-b-0 group">
        <div className="flex items-center gap-2 mb-1">
          {a.isBreaking && (
            <span className="inline-flex items-center gap-1 text-down text-[10px] font-bold uppercase">
              <Zap size={8} className="fill-down" /> Live
            </span>
          )}
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">
            {a.category.name}
          </Link>
          <span className="text-xs text-ink-500">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-semibold text-ink-100 leading-snug group-hover:text-accent transition-colors">
          <Link href={`/article/${a.slug}`}>{a.title}</Link>
        </h3>
      </div>
    );
  }

  const cardImage = a.thumbnailUrl || a.coverImageUrl;

  if (variant === "image-left") {
    return (
      <div className="flex gap-4 py-3 border-b border-ink-800 last:border-b-0 group">
        <Link href={`/article/${a.slug}`} className="h-20 w-28 flex-shrink-0 overflow-hidden bg-ink-800 rounded-md">
          {cardImage && (
            <img src={cardImage} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name}</Link>
            <span className="text-xs text-ink-500">{timeAgo(a.publishedAt)}</span>
          </div>
          <h3 className="text-sm font-semibold text-ink-100 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            <Link href={`/article/${a.slug}`}>{a.title}</Link>
          </h3>
        </div>
      </div>
    );
  }

  /* Default card */
  return (
    <article className="card-hover h-full flex flex-col group">
      <Link href={`/article/${a.slug}`} className="block aspect-[16/10] w-full overflow-hidden bg-ink-800 relative">
        {cardImage && (
          <img
            src={cardImage}
            alt={a.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        )}
        {a.isBreaking && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-down/90 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            <Zap size={8} className="fill-white" />
            Live
          </span>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/category/${a.category.slug}`} className="kicker hover:underline">{a.category.name}</Link>
          <span className="text-xs text-ink-500">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="font-serif text-lg font-bold text-ink-50 leading-snug tracking-tight group-hover:text-accent transition-colors">
          <Link href={`/article/${a.slug}`}>{a.title}</Link>
        </h3>
        <p className="mt-2 text-sm text-ink-300 line-clamp-2 flex-1 leading-relaxed">{a.excerpt}</p>
        {a.author && (
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
            <span className="font-medium">{a.author.name}</span>
            <span>·</span>
            <span>{readTime(a.body)} min read</span>
          </div>
        )}
      </div>
    </article>
  );
}

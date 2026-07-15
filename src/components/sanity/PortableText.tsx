"use client";

import { PortableText as BasePortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity";
import Link from "next/link";

interface ImageValue {
  _type: "image";
  asset: { _ref: string };
  alt?: string;
  caption?: string;
}

interface LinkMark {
  _type: "link";
  href: string;
  openInNewTab?: boolean;
}

const components = {
  types: {
    image: ({ value }: { value: ImageValue }) => {
      if (!value?.asset?._ref) return null;
      return (
        <figure className="my-6">
          <img
            src={urlFor(value).width(800).auto("format").url()}
            alt={value.alt ?? ""}
            className="w-full rounded-md"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-ink-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: LinkMark }) => {
      const href = value?.href ?? "#";
      if (href.startsWith("/")) {
        return (
          <Link href={href} className="text-accent hover:underline">
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target={value?.openInNewTab ? "_blank" : undefined}
          rel={value?.openInNewTab ? "noopener noreferrer" : undefined}
          className="text-accent hover:underline"
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-bold text-ink-50 mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-bold text-ink-100 mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-lg font-semibold text-ink-100 mt-5 mb-2">{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-accent pl-4 my-4 italic text-ink-300">
        {children}
      </blockquote>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-ink-200 leading-relaxed mb-4">{children}</p>
    ),
  },
};

export function SanityPortableText({ value }: { value: PortableTextBlock[] }) {
  return <BasePortableText value={value} components={components} />;
}

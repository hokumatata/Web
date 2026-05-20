export const ROLES = ["ADMIN", "EDITOR", "AUTHOR", "READER"] as const;
export type Role = (typeof ROLES)[number];

export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const COMMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SPAM"] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export const TICKER_TYPES = ["CRYPTO", "FX", "STOCK", "COMMODITY"] as const;
export type TickerType = (typeof TICKER_TYPES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function roleAtLeast(actual: string, required: Role): boolean {
  const order: Record<Role, number> = { READER: 0, AUTHOR: 1, EDITOR: 2, ADMIN: 3 };
  if (!isRole(actual)) return false;
  return order[actual] >= order[required];
}

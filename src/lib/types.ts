export type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "READER";

const ROLE_RANK: Record<Role, number> = {
  ADMIN: 4,
  EDITOR: 3,
  AUTHOR: 2,
  READER: 1,
};

export function isRole(v: string): v is Role {
  return v in ROLE_RANK;
}

export function roleAtLeast(current: Role, required: Role): boolean {
  return ROLE_RANK[current] >= ROLE_RANK[required];
}

/** Exact-role checks — use these where rank must not elevate ADMIN into editorial actions. */
export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

export function isEditor(role: Role): boolean {
  return role === "EDITOR";
}

export function isAuthor(role: Role): boolean {
  return role === "AUTHOR";
}

/**
 * Who may publish / reject via the editorial APIs.
 * ADMIN is ops-only and must not publish — do not use roleAtLeast here.
 */
export function canPublish(role: Role): boolean {
  return role === "EDITOR" || role === "AUTHOR";
}

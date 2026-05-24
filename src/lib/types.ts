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

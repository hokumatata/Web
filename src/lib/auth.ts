import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { isRole, Role, roleAtLeast } from "./types";

const COOKIE_NAME = "mp_session";
const ALG = "HS256";

function secretKey() {
  const s = process.env.JWT_SECRET || "the_forex_republic_jwt_session_secret_2026_default_key";
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  uid: string;
  role: Role;
  name: string;
  email: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALG] });
    if (
      typeof payload.uid === "string" &&
      typeof payload.role === "string" &&
      isRole(payload.role) &&
      typeof payload.name === "string" &&
      typeof payload.email === "string"
    ) {
      return { uid: payload.uid, role: payload.role, name: payload.name, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function getCurrentUser() {
  const s = await getSession();
  if (!s) return null;
  return prisma.user.findUnique({ where: { id: s.uid } });
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function requireRole(required: Role) {
  const s = await getSession();
  if (!s) return { ok: false as const, reason: "unauthenticated" as const };
  if (!roleAtLeast(s.role, required)) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, session: s };
}

/** Exact role match — does not elevate ADMIN via rank. Prefer for Site ops / editorial mutations. */
export async function requireExactRole(required: Role) {
  const s = await getSession();
  if (!s) return { ok: false as const, reason: "unauthenticated" as const };
  if (s.role !== required) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, session: s };
}

/** Exact match against any of the listed roles — no rank elevation. */
export async function requireExactRoles(allowed: Role[]) {
  const s = await getSession();
  if (!s) return { ok: false as const, reason: "unauthenticated" as const };
  if (!allowed.includes(s.role)) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, session: s };
}

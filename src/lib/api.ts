import { NextResponse } from "next/server";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return error("Unauthorized", 401);
}

export function forbidden() {
  return error("Forbidden", 403);
}

export function notFound(what = "Resource") {
  return error(`${what} not found`, 404);
}

export function tooManyRequests(retryAfterSeconds?: number) {
  const res = NextResponse.json(
    { error: "Too many requests. Please slow down and try again later." },
    { status: 429 }
  );
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    res.headers.set("Retry-After", String(retryAfterSeconds));
  }
  return res;
}

export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

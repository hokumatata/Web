import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export function unauthorized(error = "unauthorized") {
  return NextResponse.json({ error }, { status: 401 });
}

export function forbidden(error = "forbidden") {
  return NextResponse.json({ error }, { status: 403 });
}

export function notFound(error = "not found") {
  return NextResponse.json({ error }, { status: 404 });
}

export function serverError(error = "internal error") {
  return NextResponse.json({ error }, { status: 500 });
}

export function fromZodError(err: ZodError) {
  const message = err.errors.map((e) => `${e.path.join(".") || "field"}: ${e.message}`).join("; ");
  return badRequest(message);
}

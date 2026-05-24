import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
];

export async function POST(req: NextRequest) {
  const auth = await requireRole("AUTHOR");
  if (!auth.ok) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return error("No file provided");
  if (!ALLOWED_TYPES.includes(file.type)) return error("Unsupported file type. Use JPEG, PNG, GIF, WebP, SVG, or AVIF.");
  if (file.size > MAX_SIZE) return error("File too large. Max 5 MB.");

  const ext = file.name.split(".").pop() ?? "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, name), bytes);

  const url = `/uploads/${name}`;
  return json({ url, name, size: file.size, type: file.type }, 201);
}

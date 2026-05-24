import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { json, error, unauthorized } from "@/lib/api";
import { requireRole } from "@/lib/auth";

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
  if (!ALLOWED_TYPES.includes(file.type))
    return error("Unsupported file type. Use JPEG, PNG, GIF, WebP, SVG, or AVIF.");
  if (file.size > MAX_SIZE) return error("File too large. Max 5 MB.");

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return json({ url: blob.url, name: file.name, size: file.size, type: file.type }, 201);
}

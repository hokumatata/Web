import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { json, error, unauthorized, forbidden } from "@/lib/api";
import { requireExactRoles } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// SVG intentionally excluded: SVG files can embed <script>/event handlers and
// execute JavaScript when served inline, enabling stored XSS.
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(req: NextRequest) {
  const auth = await requireExactRoles(["AUTHOR", "EDITOR"]);
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return error("No file provided");

  const ext = EXT_BY_TYPE[file.type];
  if (!ext)
    return error("Unsupported file type. Use JPEG, PNG, GIF, WebP, or AVIF.");
  if (file.size > MAX_SIZE) return error("File too large. Max 5 MB.");

  // Never trust the client-supplied file name in the storage path. Generate a
  // random, extension-controlled name to avoid path/name injection.
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const blob = await put(`uploads/${safeName}`, file, {
    access: "public",
    contentType: file.type,
  });

  return json({ url: blob.url, name: safeName, size: file.size, type: file.type }, 201);
}

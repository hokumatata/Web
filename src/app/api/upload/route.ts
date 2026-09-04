import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { json, error, unauthorized, forbidden } from "@/lib/api";
import { requireExactRoles } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const PUBLIC_STORE_REQUIRED =
  "Cover uploads need a public Vercel Blob store. Add PUBLIC_BLOB_READ_WRITE_TOKEN (public store) on Production.";

// SVG intentionally excluded: SVG files can embed <script>/event handlers and
// execute JavaScript when served inline, enabling stored XSS.
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Prefer PUBLIC_BLOB_READ_WRITE_TOKEN (or COVER_BLOB_READ_WRITE_TOKEN) for a dedicated public store; else BLOB_READ_WRITE_TOKEN. */
function coverBlobWriteToken(): string | undefined {
  const token =
    process.env.PUBLIC_BLOB_READ_WRITE_TOKEN ||
    process.env.COVER_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN;
  return token?.trim() || undefined;
}

function isPrivateStoreRejection(message: string): boolean {
  const text = message.toLowerCase();
  return text.includes("access mismatch") || text.includes("private store");
}

function blobErrorMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : "Blob upload failed";
}

export async function POST(req: NextRequest) {
  const auth = await requireExactRoles(["AUTHOR", "EDITOR"]);
  if (!auth.ok) {
    return auth.reason === "forbidden" ? forbidden() : unauthorized();
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return error("No file provided");
  }

  const file = formData.get("file") as File | null;
  if (!file) return error("No file provided");

  const ext = EXT_BY_TYPE[file.type];
  if (!ext)
    return error("Unsupported file type. Use JPEG, PNG, GIF, WebP, or AVIF.");
  if (file.size > MAX_SIZE) return error("File too large. Max 5 MB.");

  // Never trust the client-supplied file name in the storage path. Generate a
  // random, extension-controlled name to avoid path/name injection.
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const token = coverBlobWriteToken();
  if (!token) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    return json({ url: base64, name: safeName, size: file.size, type: file.type }, 201);
  }

  // Covers must stay publicly readable (og:image, twitter:image, article <img>).
  // Never fall back to access: "private" — a private URL 403s in the browser.
  let blob;
  try {
    blob = await put(`uploads/${safeName}`, file, {
      access: "public",
      contentType: file.type,
      token,
    });
  } catch (err) {
    const message = blobErrorMessage(err);
    if (isPrivateStoreRejection(message)) {
      return error(PUBLIC_STORE_REQUIRED, 503);
    }
    return error(message, 502);
  }

  return json({ url: blob.url, name: safeName, size: file.size, type: file.type }, 201);
}

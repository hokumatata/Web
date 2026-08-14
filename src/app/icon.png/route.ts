import { renderSiteIcon } from "@/lib/site-icon";

export const contentType = "image/png";

/** JSON-LD and crawlers request `/icon.png` (not the metadata `/icon` route). */
export function GET() {
  return renderSiteIcon(512);
}

export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}

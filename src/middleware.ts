import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const APEX_HOST = "theforexrepublic.com";
const WWW_ORIGIN = "https://www.theforexrepublic.com";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host !== APEX_HOST) {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    WWW_ORIGIN,
  );
  return NextResponse.redirect(destination, 308);
}

export const config = {
  // Seller files must 200 on the apex host. Middleware does not run on
  // unmatched paths, so public/ads.txt is served as-is on both hosts.
  matcher: ["/", "/((?!ads\\.txt$|app-ads\\.txt$).*)"],
};

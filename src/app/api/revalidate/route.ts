import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sanity-webhook-secret");
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body?._type as string | undefined;

    if (type === "article") {
      revalidateTag("articles");
    } else if (type === "category") {
      revalidateTag("categories");
    } else if (type === "author") {
      revalidateTag("authors");
    } else {
      revalidateTag("articles");
      revalidateTag("categories");
      revalidateTag("authors");
    }

    return NextResponse.json({ revalidated: true, type });
  } catch {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}

import { getFxQuotes } from "@/lib/markets";
import { ok } from "@/lib/api";

export const revalidate = 120;

export async function GET() {
  const items = await getFxQuotes();
  return ok({ items });
}

import { getCryptoQuotes } from "@/lib/markets";
import { ok } from "@/lib/api";

export const revalidate = 60;

export async function GET() {
  const items = await getCryptoQuotes();
  return ok({ items });
}

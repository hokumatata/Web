import { getCryptoQuotes } from "@/lib/markets";
import { json } from "@/lib/api";

export const revalidate = 60;

export async function GET() {
  const quotes = await getCryptoQuotes();
  return json(quotes);
}

import { getFxQuotes } from "@/lib/markets";
import { json } from "@/lib/api";

export const revalidate = 120;

export async function GET() {
  const quotes = await getFxQuotes();
  return json(quotes);
}

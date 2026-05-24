import { json, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return json(session);
}

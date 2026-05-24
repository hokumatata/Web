import { json } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  clearSessionCookie();
  return json({ ok: true });
}

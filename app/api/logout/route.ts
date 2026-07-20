import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/app/lib/session-cookie";
import { destroySession } from "@/app/lib/session";

export async function POST() {
  const cookieStore = await cookies();

  // Delete the row too, not just the cookie — otherwise the token would stay
  // valid for anyone who captured it.
  await destroySession(cookieStore.get(SESSION_COOKIE)?.value);
  cookieStore.delete(SESSION_COOKIE);

  return Response.json({ ok: true });
}

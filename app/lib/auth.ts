import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { SESSION_COOKIE } from "@/app/lib/session-cookie";
import { isValidSession } from "@/app/lib/session";

export const isAuthenticated = cache(async (): Promise<boolean> => {
  const cookieStore = await cookies();
  return isValidSession(cookieStore.get(SESSION_COOKIE)?.value);
});

/**
 * The real authorization check. `proxy.ts` only sees whether a cookie exists —
 * it can't validate the token without a database read, which it must avoid — so
 * every page and mutation calls this.
 */
export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

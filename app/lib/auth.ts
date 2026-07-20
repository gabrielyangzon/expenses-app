import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { SESSION_COOKIE, isValidSessionValue } from "@/app/lib/session";

export const isAuthenticated = cache(async (): Promise<boolean> => {
  const cookieStore = await cookies();
  return isValidSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
});

/**
 * Second line of defence behind `proxy.ts`: the proxy's check is optimistic and
 * routes must not rely on it alone, so every page and mutation calls this too.
 */
export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

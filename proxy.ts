import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/app/lib/session-cookie";

/**
 * Optimistic gate only: it checks that a session cookie is *present*, never
 * that it is valid — validating means a database read, and this runs on every
 * request including prefetches. `requireSession()` does the real check.
 *
 * Deliberately one-directional. It never redirects an apparently-logged-in user
 * away from /login, because a stale cookie would then bounce between /login and
 * / forever; the login page itself does that redirect after a real check.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page and the auth endpoints must stay reachable without a session.
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico)$).*)",
  ],
};

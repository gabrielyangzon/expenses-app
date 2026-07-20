import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isValidSessionValue } from "@/app/lib/session";

// Optimistic check only — it reads the signed cookie and never touches the
// database. Pages and Server Actions re-check via `requireSession()`.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isValidSessionValue(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico)$).*)"],
};

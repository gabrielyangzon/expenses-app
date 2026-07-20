// Shared by `proxy.ts` (which must stay free of `server-only`/database imports)
// and the server-side session helpers.
export const SESSION_COOKIE = "session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

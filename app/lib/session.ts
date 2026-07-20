import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";

import { SESSION_MAX_AGE_SECONDS } from "@/app/lib/session-cookie";
import { db } from "@/db";
import { sessions } from "@/db/schema";

/**
 * The token is 256 bits of randomness, so it can't be guessed and doesn't need
 * to be signed — this is what lets the app run without a SESSION_SECRET.
 */
function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session row and returns the raw token for the cookie. */
export async function createSession(): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({ tokenHash: hashToken(token), expiresAt });

  // Opportunistic cleanup so expired rows don't accumulate.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  return token;
}

export async function isValidSession(
  token: string | undefined,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, hashToken(token)))
    .limit(1);

  if (!row) {
    return false;
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    await destroySession(token);
    return false;
  }

  return true;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) {
    return;
  }
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

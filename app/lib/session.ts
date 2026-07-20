import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";

const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Fail closed: without a secret every signature would be forgeable.
    throw new Error(
      "SESSION_SECRET is not set. Generate one with `openssl rand -hex 32`.",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** Returns a signed `<expiry>.<signature>` cookie value. */
export function createSessionValue(): { value: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return {
    value: `${payload}.${sign(payload)}`,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const separator = value.lastIndexOf(".");
  if (separator === -1) {
    return false;
  }

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

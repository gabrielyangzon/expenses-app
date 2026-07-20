import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export const PIN_LENGTH = 4;

export function isValidPinFormat(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** Produces the `scrypt$<salt>$<derivedKey>` string stored in `login.password`. */
export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(pin, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [scheme, salt, derived] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !derived) {
    return false;
  }

  const expected = Buffer.from(derived, "hex");
  const actual = scryptSync(pin, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

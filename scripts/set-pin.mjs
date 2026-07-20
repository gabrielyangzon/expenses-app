// Sets (or replaces) the app-lock PIN.
//   npm run set-pin -- 1234
//
// Stores a scrypt hash in `login.password`; the PIN itself is never written
// to the database.
import { randomBytes, scryptSync } from "node:crypto";

import { neon } from "@neondatabase/serverless";
// @next/env is CommonJS, so it has no named exports here.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const pin = process.argv[2];

if (!/^\d{4}$/.test(pin ?? "")) {
  console.error("Usage: npm run set-pin -- <4 digits>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (expected in .env.local).");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = `scrypt$${salt}$${scryptSync(pin, salt, 64).toString("hex")}`;

const sql = neon(process.env.DATABASE_URL);
await sql`DELETE FROM login`;
await sql`INSERT INTO login (password) VALUES (${hash})`;

console.log("PIN updated.");

import {
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Other",
] as const;

export const expenseCategoryEnum = pgEnum(
  "expense_category",
  EXPENSE_CATEGORIES,
);

export const PAYERS = ["RoseAnn", "Gabriel"] as const;

export const payerEnum = pgEnum("payer", PAYERS);

export type Payer = (typeof PAYERS)[number];

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    category: expenseCategoryEnum("category").notNull(),
    paidBy: payerEnum("paid_by").notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("expenses_date_idx").on(table.date)],
);

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

/**
 * Single-PIN app lock. `password` holds a scrypt hash
 * (`scrypt$<salt>$<derivedKey>`), never the PIN itself — see `scripts/set-pin.mjs`.
 */
export const login = pgTable("login", {
  id: serial("id").primaryKey(),
  password: text("password").notNull(),
});

export type Login = typeof login.$inferSelect;

/**
 * Server-side sessions. The cookie carries a random opaque token; only its
 * SHA-256 hash is stored, so a leaked database dump can't be replayed as a
 * live session. Because the token is random rather than signed, no signing
 * secret is needed.
 */
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type Session = typeof sessions.$inferSelect;

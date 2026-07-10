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

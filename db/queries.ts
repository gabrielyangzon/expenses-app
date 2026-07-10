import "server-only";

import { and, desc, gte, lt, sql } from "drizzle-orm";

import { db } from "./index";
import { PAYERS, type Payer, expenses } from "./schema";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function getMonthRange(year: number, month: number) {
  const start = `${year}-${pad(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${pad(nextMonth)}-01`;
  return { start, end };
}

export async function getExpensesForMonth(year: number, month: number) {
  const { start, end } = getMonthRange(year, month);
  return db
    .select()
    .from(expenses)
    .where(and(gte(expenses.date, start), lt(expenses.date, end)))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));
}

export async function getMonthTotal(year: number, month: number) {
  const { start, end } = getMonthRange(year, month);
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(and(gte(expenses.date, start), lt(expenses.date, end)));
  return row?.total ?? "0";
}

export async function getMonthTotalsByPayer(
  year: number,
  month: number,
): Promise<Record<Payer, string>> {
  const { start, end } = getMonthRange(year, month);
  const rows = await db
    .select({
      paidBy: expenses.paidBy,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(and(gte(expenses.date, start), lt(expenses.date, end)))
    .groupBy(expenses.paidBy);

  const totals = Object.fromEntries(
    PAYERS.map((payer) => [payer, "0"]),
  ) as Record<Payer, string>;
  for (const row of rows) {
    totals[row.paidBy] = row.total;
  }
  return totals;
}

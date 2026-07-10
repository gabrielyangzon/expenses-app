import Link from "next/link";

import { PAYER_BADGE_CLASSES } from "@/app/lib/payer-colors";
import type { Expense } from "@/db/schema";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">
        No expenses this month.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 text-sm">
      {expenses.map((expense) => (
        <li key={expense.id}>
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="flex items-center gap-3 py-2 hover:bg-zinc-50"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${PAYER_BADGE_CLASSES[expense.paidBy]}`}
            >
              {expense.paidBy[0]}
            </span>
            <span className="w-16 shrink-0 text-xs text-zinc-500">
              {dateFormatter.format(new Date(`${expense.date}T00:00:00`))}
            </span>
            <span className="min-w-0 flex-1 truncate text-black">
              {expense.description}
            </span>
            <span className="hidden shrink-0 text-xs text-zinc-500 sm:inline">
              {expense.category}
            </span>
            <span className="shrink-0 whitespace-nowrap font-medium tabular-nums text-black">
              {currencyFormatter.format(Number(expense.amount))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

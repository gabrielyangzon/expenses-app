import Link from "next/link";

import { rateOnOrBefore, type DailyRates } from "@/app/lib/daily-rates";
import { PAYER_BADGE_CLASSES } from "@/app/lib/payer-colors";
import type { Expense } from "@/db/schema";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function groupByDate(expenses: Expense[]) {
  const groups: { date: string; expenses: Expense[] }[] = [];
  for (const expense of expenses) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === expense.date) {
      lastGroup.expenses.push(expense);
    } else {
      groups.push({ date: expense.date, expenses: [expense] });
    }
  }
  return groups;
}

export function ExpenseList({
  expenses,
  dailyRates,
}: {
  expenses: Expense[];
  dailyRates: DailyRates;
}) {
  if (expenses.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">
        No expenses this month.
      </p>
    );
  }

  const groups = groupByDate(expenses);

  return (
    <div className="flex flex-col text-sm">
      {groups.map((group) => {
        const dayRate = rateOnOrBefore(dailyRates, group.date);
        return (
          <div key={group.date}>
            <div className="flex items-baseline justify-between border-b border-zinc-200 bg-zinc-50 px-1 py-1 text-xs text-zinc-500">
              <span>
                {dateFormatter.format(new Date(`${group.date}T00:00:00`))}
              </span>
              <span>€1 = {phpFormatter.format(dayRate)}</span>
            </div>
            <ul className="divide-y divide-zinc-200">
              {group.expenses.map((expense) => (
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
                    <span className="min-w-0 flex-1 truncate text-black">
                      {expense.description}
                    </span>
                    <span className="hidden shrink-0 text-xs text-zinc-500 sm:inline">
                      {expense.category}
                    </span>
                    <span className="flex shrink-0 flex-col items-end whitespace-nowrap tabular-nums">
                      <span className="font-medium text-black">
                        {currencyFormatter.format(Number(expense.amount))}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {phpFormatter.format(Number(expense.amount) * dayRate)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

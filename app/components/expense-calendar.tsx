import Link from "next/link";

import { rateOnOrBefore, type DailyRates } from "@/app/lib/daily-rates";
import { daysInMonth, firstWeekdayOfMonth, todayIsoDate } from "@/app/lib/month";
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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ExpenseCalendar({
  year,
  month,
  expenses,
  dailyRates,
}: {
  year: number;
  month: number;
  expenses: Expense[];
  dailyRates: DailyRates;
}) {
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayOfMonth(year, month);
  const today = todayIsoDate();

  const expensesByDay = new Map<number, Expense[]>();
  for (const expense of expenses) {
    const day = Number(expense.date.split("-")[2]);
    const list = expensesByDay.get(day) ?? [];
    list.push(expense);
    expensesByDay.set(day, list);
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid grid-cols-7 gap-1 text-xs">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="pb-1 text-center font-medium text-zinc-500"
        >
          {label}
        </div>
      ))}
      {cells.map((day, index) => {
        if (day === null) {
          return <div key={`blank-${index}`} />;
        }

        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayExpenses = expensesByDay.get(day) ?? [];
        const isToday = dateStr === today;
        const dayRate = rateOnOrBefore(dailyRates, dateStr);

        return (
          <div
            key={dateStr}
            className={`flex min-h-[92px] flex-col gap-1 rounded-md border p-1 ${
              isToday ? "border-zinc-900" : "border-zinc-200"
            }`}
          >
            <div className="flex items-baseline justify-between">
              {dayExpenses.length > 0 ? (
                <span className="truncate text-[8px] text-zinc-400">
                  €1={phpFormatter.format(dayRate)}
                </span>
              ) : (
                <span />
              )}
              <span className="text-right text-[11px] text-zinc-400">
                {day}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
              {dayExpenses.map((expense) => (
                <Link
                  key={expense.id}
                  href={`/expenses/${expense.id}/edit`}
                  title={`${expense.description} — ${currencyFormatter.format(Number(expense.amount))} (${phpFormatter.format(Number(expense.amount) * dayRate)}) — paid by ${expense.paidBy}`}
                  className="flex items-center gap-1 rounded bg-zinc-100 px-1 py-0.5 hover:bg-zinc-200"
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${PAYER_BADGE_CLASSES[expense.paidBy]}`}
                  >
                    {expense.paidBy[0]}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {expense.description}
                  </span>
                  <span className="flex shrink-0 flex-col items-end whitespace-nowrap tabular-nums">
                    <span>{currencyFormatter.format(Number(expense.amount))}</span>
                    <span className="text-[8px] leading-tight text-zinc-400">
                      {phpFormatter.format(Number(expense.amount) * dayRate)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

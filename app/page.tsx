import { createExpenseAction } from "@/app/actions";
import { ExpenseForm } from "@/app/components/expense-form";
import { ExpenseView } from "@/app/components/expense-view";
import { MonthNav } from "@/app/components/month-nav";
import { parseMonthParam, todayIsoDate } from "@/app/lib/month";
import { PAYER_BADGE_CLASSES } from "@/app/lib/payer-colors";
import { PAYERS } from "@/db/schema";
import {
  getExpensesForMonth,
  getMonthTotal,
  getMonthTotalsByPayer,
} from "@/db/queries";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const [expenses, total, totalsByPayer] = await Promise.all([
    getExpensesForMonth(year, month),
    getMonthTotal(year, month),
    getMonthTotalsByPayer(year, month),
  ]);

  const [payerA, payerB] = PAYERS;
  const difference = Number(totalsByPayer[payerA]) - Number(totalsByPayer[payerB]);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6">
        <h1 className="text-2xl font-semibold text-black">Expense Tracker</h1>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <MonthNav year={year} month={month} />
          <p className="mt-4 text-center text-sm text-zinc-500">
            Total spent
          </p>
          <p className="text-center text-3xl font-bold text-black">
            {currencyFormatter.format(Number(total))}
          </p>
          <div className="mt-3 flex justify-center gap-4 text-sm text-zinc-600">
            {PAYERS.map((payer) => (
              <span key={payer} className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${PAYER_BADGE_CLASSES[payer]}`}
                />
                {payer}: {currencyFormatter.format(Number(totalsByPayer[payer]))}
              </span>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-zinc-500">
            {difference === 0
              ? "Even"
              : `Difference: ${currencyFormatter.format(Math.abs(difference))} (${
                  difference > 0 ? payerA : payerB
                } spent more)`}
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-medium text-black">Add expense</h2>
          <ExpenseForm
            action={createExpenseAction}
            defaultValues={{ category: "Food", date: todayIsoDate() }}
            submitLabel="Add"
          />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-medium text-black">Expenses</h2>
          <ExpenseView year={year} month={month} expenses={expenses} />
        </section>
      </main>
    </div>
  );
}

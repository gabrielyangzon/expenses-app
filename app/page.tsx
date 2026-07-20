import { AddExpenseForm } from "@/app/components/add-expense-form";
import { ExpenseView } from "@/app/components/expense-view";
import { LogoutButton } from "@/app/components/logout-button";
import { MonthNav } from "@/app/components/month-nav";
import { rateOnOrBefore } from "@/app/lib/daily-rates";
import { getEurToPhpRate, getEurToPhpRatesForRange } from "@/app/lib/exchange-rate";
import { requireSession } from "@/app/lib/auth";
import { parseMonthParam, todayIsoDate } from "@/app/lib/month";
import { PAYER_BADGE_CLASSES } from "@/app/lib/payer-colors";
import { PAYERS, type Payer } from "@/db/schema";
import {
  getExpensesForMonth,
  getMonthRange,
  getMonthTotal,
  getMonthTotalsByPayer,
} from "@/db/queries";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const rateDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireSession();

  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);
  const { start: monthStart, end: monthEndExclusive } = getMonthRange(
    year,
    month,
  );

  const [expenses, total, totalsByPayer, todayRate, dailyRates] =
    await Promise.all([
      getExpensesForMonth(year, month),
      getMonthTotal(year, month),
      getMonthTotalsByPayer(year, month),
      getEurToPhpRate(),
      getEurToPhpRatesForRange(monthStart, monthEndExclusive),
    ]);
  const { rate: currentRate, date: currentRateDate } = todayRate;

  const totalsByPayerPhp = Object.fromEntries(
    PAYERS.map((payer) => [payer, 0]),
  ) as Record<Payer, number>;
  for (const expense of expenses) {
    const dayRate = rateOnOrBefore(dailyRates, expense.date);
    totalsByPayerPhp[expense.paidBy] += Number(expense.amount) * dayRate;
  }
  const totalPhp = Object.values(totalsByPayerPhp).reduce(
    (sum, value) => sum + value,
    0,
  );

  const [payerA, payerB] = PAYERS;
  const difference = Number(totalsByPayer[payerA]) - Number(totalsByPayer[payerB]);
  const differencePhp = totalsByPayerPhp[payerA] - totalsByPayerPhp[payerB];

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black">Expense Tracker</h1>
          <LogoutButton />
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <MonthNav year={year} month={month} />
          <p className="mt-4 text-center text-sm text-zinc-500">
            Total spent
          </p>
          <p className="text-center text-3xl font-bold text-black">
            {currencyFormatter.format(Number(total))}
          </p>
          <p className="text-center text-sm text-zinc-400">
            ≈ {phpFormatter.format(totalPhp)}
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
              : `Difference: ${currencyFormatter.format(Math.abs(difference))} (${phpFormatter.format(
                  Math.abs(differencePhp),
                )}) (${difference > 0 ? payerA : payerB} spent more)`}
          </p>
          <p className="mt-1 text-center text-[11px] text-zinc-400">
            Today&apos;s rate: €1 = {phpFormatter.format(currentRate)} (as of{" "}
            {rateDateFormatter.format(new Date(`${currentRateDate}T00:00:00`))}
            ) — totals above use each day&apos;s own rate
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-medium text-black">Add expense</h2>
          <AddExpenseForm defaultCategory="Food" defaultDate={todayIsoDate()} />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-medium text-black">Expenses</h2>
          <ExpenseView
            year={year}
            month={month}
            expenses={expenses}
            dailyRates={dailyRates}
          />
        </section>
      </main>
    </div>
  );
}

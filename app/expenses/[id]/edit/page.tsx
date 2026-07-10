import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateExpenseAction } from "@/app/actions";
import { DeleteExpenseButton } from "@/app/components/delete-expense-button";
import { ExpenseForm } from "@/app/components/expense-form";
import { db } from "@/db";
import { expenses } from "@/db/schema";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const expense = await db.query.expenses.findFirst({
    where: eq(expenses.id, id),
  });

  if (!expense) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6">
        <h1 className="text-2xl font-semibold text-black">Edit expense</h1>
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <ExpenseForm
            action={updateExpenseAction}
            defaultValues={expense}
            submitLabel="Save"
          />
        </section>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Cancel
          </Link>
          <DeleteExpenseButton id={expense.id} />
        </div>
      </main>
    </div>
  );
}

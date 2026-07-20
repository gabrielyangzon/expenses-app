"use client";

import { useActionState } from "react";

import { createExpenseAction } from "@/app/actions";
import { ExpenseForm } from "@/app/components/expense-form";
import { CREATE_EXPENSE_INITIAL_STATE } from "@/app/lib/create-expense-state";
import type { Expense } from "@/db/schema";

type AddExpenseFormProps = {
  defaultCategory: Expense["category"];
  defaultDate: string;
};

export function AddExpenseForm({
  defaultCategory,
  defaultDate,
}: AddExpenseFormProps) {
  const [state, formAction] = useActionState(
    createExpenseAction,
    CREATE_EXPENSE_INITIAL_STATE,
  );

  return (
    <div className="flex flex-col gap-3">
      <ExpenseForm
        // Remounts after each successful insert so the fields clear.
        key={state.submissions}
        action={formAction}
        defaultValues={{ category: defaultCategory, date: defaultDate }}
        submitLabel="Add"
      />
      {state.status !== "idle" && (
        <p
          role="status"
          className={
            state.status === "success"
              ? "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          }
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

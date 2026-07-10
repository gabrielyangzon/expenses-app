"use client";

import { deleteExpenseAction } from "@/app/actions";

export function DeleteExpenseButton({ id }: { id: number }) {
  return (
    <form
      action={deleteExpenseAction}
      onSubmit={(event) => {
        if (!confirm("Delete this expense?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}

import { EXPENSE_CATEGORIES, PAYERS, type Expense } from "@/db/schema";

type ExpenseFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<
    Pick<
      Expense,
      "id" | "description" | "amount" | "category" | "paidBy" | "date"
    >
  >;
  submitLabel: string;
};

const inputClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";
const labelClassName = "text-sm font-medium text-zinc-700";

export function ExpenseForm({
  action,
  defaultValues,
  submitLabel,
}: ExpenseFormProps) {
  return (
    <form
      action={action}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      {defaultValues?.id !== undefined && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="description" className={labelClassName}>
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          defaultValue={defaultValues?.description}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className={labelClassName}>
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={defaultValues?.amount}
          className={`${inputClassName} w-28`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className={labelClassName}>
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValues?.category ?? ""}
          className={inputClassName}
        >
          <option value="" disabled>
            Select…
          </option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="paidBy" className={labelClassName}>
          Paid by
        </label>
        <select
          id="paidBy"
          name="paidBy"
          required
          defaultValue={defaultValues?.paidBy ?? ""}
          className={inputClassName}
        >
          <option value="" disabled>
            Select…
          </option>
          {PAYERS.map((payer) => (
            <option key={payer} value={payer}>
              {payer}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className={labelClassName}>
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues?.date}
          className={inputClassName}
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}

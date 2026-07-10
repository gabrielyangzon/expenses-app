"use client";

export function MonthPicker({ value }: { value: string }) {
  return (
    <form>
      <input
        type="month"
        name="month"
        defaultValue={value}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
      />
    </form>
  );
}

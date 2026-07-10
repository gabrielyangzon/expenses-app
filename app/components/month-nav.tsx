import Link from "next/link";

import { formatMonthParam, monthLabel, shiftMonth } from "@/app/lib/month";

import { MonthPicker } from "./month-picker";

export function MonthNav({ year, month }: { year: number; month: number }) {
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        href={`/?month=${formatMonthParam(prev.year, prev.month)}`}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
      >
        ← Prev
      </Link>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-semibold">{monthLabel(year, month)}</span>
        <MonthPicker value={formatMonthParam(year, month)} />
      </div>
      <Link
        href={`/?month=${formatMonthParam(next.year, next.month)}`}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
      >
        Next →
      </Link>
    </div>
  );
}

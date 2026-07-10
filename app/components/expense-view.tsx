"use client";

import { useState, useSyncExternalStore } from "react";

import { ExpenseCalendar } from "@/app/components/expense-calendar";
import { ExpenseList } from "@/app/components/expense-list";
import type { DailyRates } from "@/app/lib/daily-rates";
import type { Expense } from "@/db/schema";

type View = "calendar" | "list";

const MOBILE_QUERY = "(max-width: 639px)";

function subscribeToViewport(callback: () => void) {
  const mediaQueryList = window.matchMedia(MOBILE_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getViewportDefault(): View {
  return window.matchMedia(MOBILE_QUERY).matches ? "list" : "calendar";
}

function getServerViewportDefault(): View {
  return "list";
}

export function ExpenseView({
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
  const defaultView = useSyncExternalStore(
    subscribeToViewport,
    getViewportDefault,
    getServerViewportDefault,
  );
  const [override, setOverride] = useState<View | null>(null);
  const view = override ?? defaultView;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="inline-flex rounded-md border border-zinc-300 bg-zinc-100 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setOverride("calendar")}
            className={`rounded px-3 py-1 ${
              view === "calendar"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-500"
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setOverride("list")}
            className={`rounded px-3 py-1 ${
              view === "list" ? "bg-white text-black shadow-sm" : "text-zinc-500"
            }`}
          >
            List
          </button>
        </div>
      </div>
      {view === "calendar" ? (
        <ExpenseCalendar
          year={year}
          month={month}
          expenses={expenses}
          dailyRates={dailyRates}
        />
      ) : (
        <ExpenseList expenses={expenses} dailyRates={dailyRates} />
      )}
    </div>
  );
}

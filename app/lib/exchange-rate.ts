import "server-only";

import type { DailyRates } from "@/app/lib/daily-rates";

const FALLBACK_EUR_TO_PHP_RATE = 65;

// Weekend/holiday gaps in a requested range are carried forward from the
// nearest earlier published rate, so fetch a few extra days of lookback.
const CARRY_FORWARD_BUFFER_DAYS = 5;

export type EurToPhpRate = {
  rate: number;
  date: string;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function getEurToPhpRate(): Promise<EurToPhpRate> {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=PHP",
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      return { rate: FALLBACK_EUR_TO_PHP_RATE, date: todayIsoDate() };
    }
    const data = (await response.json()) as {
      rates?: { PHP?: number };
      date?: string;
    };
    return {
      rate: data.rates?.PHP ?? FALLBACK_EUR_TO_PHP_RATE,
      date: data.date ?? todayIsoDate(),
    };
  } catch {
    return { rate: FALLBACK_EUR_TO_PHP_RATE, date: todayIsoDate() };
  }
}

/**
 * Fetches the historical EUR->PHP rate for every published date in
 * [rangeStart, rangeEndExclusive), plus a few days of lookback so weekend/
 * holiday dates can still resolve to the prior business day's rate.
 */
export async function getEurToPhpRatesForRange(
  rangeStart: string,
  rangeEndExclusive: string,
): Promise<DailyRates> {
  const fetchStart = addDays(rangeStart, -CARRY_FORWARD_BUFFER_DAYS);
  const fetchEnd = addDays(rangeEndExclusive, -1);

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/${fetchStart}..${fetchEnd}?base=EUR&symbols=PHP`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      return {};
    }
    const data = (await response.json()) as {
      rates?: Record<string, { PHP?: number }>;
    };
    const rates: DailyRates = {};
    for (const [date, value] of Object.entries(data.rates ?? {})) {
      if (typeof value.PHP === "number") {
        rates[date] = value.PHP;
      }
    }
    return rates;
  } catch {
    return {};
  }
}

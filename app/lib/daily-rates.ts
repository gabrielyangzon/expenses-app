export type DailyRates = Record<string, number>;

const FALLBACK_EUR_TO_PHP_RATE = 65;

/**
 * FX markets are closed on weekends/holidays, so a given date may not have
 * its own published rate. Carry forward the most recent earlier rate.
 */
export function rateOnOrBefore(rates: DailyRates, date: string): number {
  let bestDate = "";
  let bestRate: number | undefined;
  for (const [rateDate, rate] of Object.entries(rates)) {
    if (rateDate <= date && rateDate > bestDate) {
      bestDate = rateDate;
      bestRate = rate;
    }
  }
  return bestRate ?? FALLBACK_EUR_TO_PHP_RATE;
}

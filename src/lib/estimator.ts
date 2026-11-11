import type { CategorySlug, Item } from "@/data/types";
import { feeRateForRetail } from "./fees";

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export type Estimate = {
  /** "weekend" for most categories, "week" for textbooks (no weekend rate). */
  period: "weekend" | "week";
  medianRate: number;
  feeRate: number;
  grossCents: number;
  feeCents: number;
  netCents: number;
};

/**
 * Lender earnings estimate for the homepage: category median weekend rate
 * (week rate for textbooks) × periods per month, minus the tiered Dibs fee
 * for the category's median retail value.
 */
export function estimateMonthly(items: Item[], category: CategorySlug, perMonth: number): Estimate {
  const inCat = items.filter((i) => i.categorySlug === category);
  const weekendRates = inCat.map((i) => i.rates.weekend).filter((r): r is number => r !== undefined);
  const period: Estimate["period"] = weekendRates.length > 0 ? "weekend" : "week";
  const rates = period === "weekend" ? weekendRates : inCat.map((i) => i.rates.week).filter((r): r is number => r !== undefined);
  const medianRate = median(rates);
  const feeRate = feeRateForRetail(median(inCat.map((i) => i.retailValue)));
  const grossCents = Math.round(medianRate * 100 * perMonth);
  const feeCents = Math.round(grossCents * feeRate);
  return { period, medianRate, feeRate, grossCents, feeCents, netCents: grossCents - feeCents };
}

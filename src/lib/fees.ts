import { CAMPUS } from "@/data/campus";
import type { Item } from "@/data/types";

/**
 * Lender fee tiers (customer research: "if it's more valuable, probably a higher cut").
 * 5% under $200 retail, 8% for $200–499, 10% for $500+. Renters never pay a fee.
 */
export function lenderFeeRate(item: Pick<Item, "retailValue">): number {
  return feeRateForRetail(item.retailValue);
}

export function feeRateForRetail(retailValue: number): number {
  if (retailValue < 200) return 0.05;
  if (retailValue < 500) return 0.08;
  return 0.1;
}

/** Lender fee in cents on a completed rental. 0 on the lender's first rental. Shown to lenders only. */
export function lenderFeeCents(subtotalCents: number, item: Pick<Item, "retailValue">, isFirstRental = false): number {
  if (isFirstRental) return 0;
  return Math.round(subtotalCents * lenderFeeRate(item));
}

/** Renter booking fee: always zero. Free to join, pay only when you rent. */
export const RENTER_FEE_CENTS = 0;

/** NYC sales tax on the rental subtotal, rounded to the cent. */
export function salesTaxCents(subtotalCents: number, rate: number = CAMPUS.salesTaxRate): number {
  return Math.round(subtotalCents * rate);
}

/** Deposit holds are summed but never added to the amount charged today. */
export function depositHoldCents(deposits: number[]): number {
  return deposits.reduce((sum, d) => sum + Math.round(d * 100), 0);
}

export const LATE_FEE_POLICY = "1.5× the day rate per late day, taken from the deposit.";

/** Late fee per day in cents: 1.5× the day rate (or the week rate ÷ 7 for items without one). */
export function lateFeePerDayCents(item: Pick<Item, "rates">): number {
  const day = item.rates.day ?? (item.rates.week ? item.rates.week / 7 : 0);
  return Math.round(day * 100 * 1.5);
}

export type OrderTotals = {
  subtotalCents: number;
  feeCents: number;
  taxCents: number;
  dueTodayCents: number;
  depositHoldCents: number;
};

/** Renter totals for a bag: subtotal + tax is due today; the deposit is a separate hold. */
export function orderTotals(lines: { subtotalCents: number; depositCents: number }[]): OrderTotals {
  const subtotalCents = lines.reduce((s, l) => s + l.subtotalCents, 0);
  const taxCents = salesTaxCents(subtotalCents);
  const hold = lines.reduce((s, l) => s + l.depositCents, 0);
  return {
    subtotalCents,
    feeCents: RENTER_FEE_CENTS,
    taxCents,
    dueTodayCents: subtotalCents + RENTER_FEE_CENTS + taxCents,
    depositHoldCents: hold,
  };
}

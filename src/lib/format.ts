import { format } from "date-fns";

export type RateUnit = "day" | "weekend" | "week" | "semester";

/** Whole dollars when possible, cents only when needed: 24 -> "$24", 24.5 -> "$24.50". */
export function formatDollars(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const whole = Number.isInteger(rounded);
  return (
    "$" +
    rounded.toLocaleString("en-US", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Integer cents to "$24" / "$24.50". */
export function formatCents(cents: number): string {
  return formatDollars(cents / 100);
}

/** Integer cents always with two decimals, for totals and tax: "$1.95". */
export function formatCentsExact(cents: number): string {
  return (
    (cents < 0 ? "−$" : "$") +
    (Math.abs(cents) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/** "$24 / day" */
export function formatRate(amount: number, unit: RateUnit): string {
  return `${formatDollars(amount)} / ${unit}`;
}

/** House date style: "Fri, Nov 21" */
export function formatDay(d: Date): string {
  return format(d, "EEE, MMM d");
}

/** "Fri, Nov 21 → Sun, Nov 23" */
export function formatRange(start: Date, end: Date): string {
  return `${formatDay(start)} → ${formatDay(end)}`;
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

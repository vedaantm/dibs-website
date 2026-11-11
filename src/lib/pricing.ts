import { addDays, addWeeks, differenceInCalendarDays, format, isBefore, startOfDay } from "date-fns";
import type { Item } from "@/data/types";
import { toISODate, today as todayFn } from "./dates";
import { formatCents } from "./format";

export const MAX_RANGE_DAYS = 30;
export const SEMESTER_WEEKS = 15;

export type Selection = { start: Date; end: Date } | { plan: "semester"; start: Date };

export type QuoteLine = { label: string; qty: number; unitPrice: number; total: number };

export type BestPlan = "day" | "weekend" | "week" | "mixed" | "semester";

export type Quote = {
  ok: boolean;
  error?: string;
  days: number;
  lines: QuoteLine[];
  /** cents */
  subtotal: number;
  /** cents; a hold, never part of the charged total */
  deposit: number;
  bestPlan: BestPlan;
  start: Date;
  end: Date;
  returnBy: Date;
};

const cents = (dollars: number) => Math.round(dollars * 100);

function line(qty: number, unit: "day" | "week" | "weekend" | "semester", unitCents: number): QuoteLine {
  const noun =
    unit === "weekend" ? (qty === 1 ? "weekend" : "weekends") : unit === "semester" ? "semester" : `${unit}${qty === 1 ? "" : "s"}`;
  return { label: `${qty} ${noun} × ${formatCents(unitCents)}`, qty, unitPrice: unitCents, total: qty * unitCents };
}

/** Fri or Sat start, Sat or Sun end, within the same weekend. */
export function isWeekendRange(start: Date, end: Date): boolean {
  const s = start.getDay();
  const e = end.getDay();
  const span = differenceInCalendarDays(end, start);
  if (span < 0 || span > 2) return false;
  if (s === 5) return (span === 1 && e === 6) || (span === 2 && e === 0);
  if (s === 6) return (span === 0 && e === 6) || (span === 1 && e === 0);
  return false;
}

/** "Nov 21", "Nov 21–22", "Nov 30–Dec 1" for each contiguous run of blocked dates. */
export function describeBlocked(dates: string[]): string {
  const sorted = [...new Set(dates)].sort();
  const runs: [string, string][] = [];
  for (const d of sorted) {
    const last = runs[runs.length - 1];
    if (last && toISODate(addDays(new Date(`${last[1]}T00:00:00`), 1)) === d) last[1] = d;
    else runs.push([d, d]);
  }
  return runs
    .map(([a, b]) => {
      const da = new Date(`${a}T00:00:00`);
      const db = new Date(`${b}T00:00:00`);
      if (a === b) return format(da, "MMM d");
      if (da.getMonth() === db.getMonth()) return `${format(da, "MMM d")}–${format(db, "d")}`;
      return `${format(da, "MMM d")}–${format(db, "MMM d")}`;
    })
    .join(", ");
}

export function blockedInRange(item: Pick<Item, "blockedDates">, start: Date, end: Date): string[] {
  const s = toISODate(start);
  const e = toISODate(end);
  return item.blockedDates.filter((d) => d >= s && d <= e);
}

type Candidate = { lines: QuoteLine[]; plan: BestPlan };
const total = (c: Candidate) => c.lines.reduce((s, l) => s + l.total, 0);

/** Every valid way to bill `days`; the caller takes the cheapest. */
function candidates(item: Item, days: number, weekend: boolean): Candidate[] {
  const r = item.rates;
  const out: Candidate[] = [];
  if (r.day !== undefined) {
    out.push({ lines: [line(days, "day", cents(r.day))], plan: "day" });
    if (r.week !== undefined) {
      const weeks = Math.floor(days / 7);
      const rest = days % 7;
      if (weeks > 0) {
        const ls = [line(weeks, "week", cents(r.week))];
        if (rest > 0) ls.push(line(rest, "day", cents(r.day)));
        out.push({ lines: ls, plan: rest > 0 ? "mixed" : "week" });
      }
      if (rest > 0) out.push({ lines: [line(weeks + 1, "week", cents(r.week))], plan: "week" });
    }
  } else if (r.week !== undefined) {
    // No day rate (textbooks): whole weeks, minimum 1.
    out.push({ lines: [line(Math.max(1, Math.ceil(days / 7)), "week", cents(r.week))], plan: "week" });
  }
  if (weekend && r.weekend !== undefined) out.push({ lines: [line(1, "weekend", cents(r.weekend))], plan: "weekend" });
  return out;
}

function fail(item: Item, start: Date, end: Date, error: string, days = 0): Quote {
  return {
    ok: false,
    error,
    days,
    lines: [],
    subtotal: 0,
    deposit: cents(item.deposit),
    bestPlan: "day",
    start,
    end,
    returnBy: end,
  };
}

/**
 * Prices a rental. Money is integer cents. Rejects past starts, blocked dates,
 * ranges over 30 days (unless semester) and anything shorter than item.minDays.
 */
export function quoteRental(item: Item, sel: Selection, opts: { today?: Date } = {}): Quote {
  const now = startOfDay(opts.today ?? todayFn());
  const start = startOfDay(sel.start);

  if ("plan" in sel) {
    const end = addWeeks(start, SEMESTER_WEEKS);
    if (item.rates.semester === undefined) return fail(item, start, end, "No semester rate on this item.");
    if (isBefore(start, now)) return fail(item, start, end, "That start date has passed. Pick today or later.");
    const blocked = blockedInRange(item, start, end);
    if (blocked.length) return fail(item, start, end, `Booked ${describeBlocked(blocked)}. Try a later start.`);
    const days = differenceInCalendarDays(end, start) + 1;
    return {
      ok: true,
      days,
      lines: [line(1, "semester", cents(item.rates.semester))],
      subtotal: cents(item.rates.semester),
      deposit: cents(item.deposit),
      bestPlan: "semester",
      start,
      end,
      returnBy: end,
    };
  }

  const end = startOfDay(sel.end);
  if (isBefore(end, start)) return fail(item, start, end, "Return date is before the pickup date.");
  const days = differenceInCalendarDays(end, start) + 1;
  if (isBefore(start, now)) return fail(item, start, end, "That start date has passed. Pick today or later.", days);
  if (days > MAX_RANGE_DAYS) {
    const msg =
      item.rates.semester !== undefined
        ? `Rentals max out at ${MAX_RANGE_DAYS} days. Pick the semester plan for longer.`
        : `Rentals max out at ${MAX_RANGE_DAYS} days.`;
    return fail(item, start, end, msg, days);
  }
  if (item.minDays && days < item.minDays) return fail(item, start, end, `Minimum rental is ${item.minDays} days.`, days);
  const blocked = blockedInRange(item, start, end);
  if (blocked.length) return fail(item, start, end, `Booked ${describeBlocked(blocked)}. Try other dates.`, days);

  const options = candidates(item, days, isWeekendRange(start, end));
  if (options.length === 0) return fail(item, start, end, "This item rents by the semester only.", days);
  const best = options.reduce((a, b) => (total(b) < total(a) ? b : a));
  return {
    ok: true,
    days,
    lines: best.lines,
    subtotal: total(best),
    deposit: cents(item.deposit),
    bestPlan: best.plan,
    start,
    end,
    returnBy: end,
  };
}

/** First day ≥ from where `length` consecutive days are free of blocked dates. */
export function nextAvailableStart(item: Pick<Item, "blockedDates">, from: Date, length: number, limit = 180): Date | null {
  let d = startOfDay(from);
  for (let i = 0; i < limit; i++) {
    if (blockedInRange(item, d, addDays(d, length - 1)).length === 0) return d;
    d = addDays(d, 1);
  }
  return null;
}

/** Next Fri–Sun with no blocked dates (a weekend already underway counts from today). */
export function nextAvailableWeekend(item: Pick<Item, "blockedDates">, from: Date, limit = 26): { start: Date; end: Date } | null {
  let d = startOfDay(from);
  const dow = d.getDay();
  // Already Sat/Sun: offer the rest of this weekend first.
  if (dow === 6 || dow === 0) {
    const end = dow === 6 ? addDays(d, 1) : d;
    if (blockedInRange(item, d, end).length === 0 && dow === 6) return { start: d, end };
  }
  d = addDays(d, (5 - dow + 7) % 7);
  for (let i = 0; i < limit; i++) {
    const end = addDays(d, 2);
    if (blockedInRange(item, d, end).length === 0) return { start: d, end };
    d = addDays(d, 7);
  }
  return null;
}

/** Semester start: the first day after which 15 weeks are free. */
export function nextAvailableSemester(item: Pick<Item, "blockedDates">, from: Date): Date | null {
  return nextAvailableStart(item, from, SEMESTER_WEEKS * 7 + 1);
}

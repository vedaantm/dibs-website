import { addDays, format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

/** yyyy-MM-dd for a local date. */
export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Parses yyyy-MM-dd as a local date (not UTC). */
export function fromISODate(s: string): Date {
  return startOfDay(parseISO(s));
}

export function today(): Date {
  return startOfDay(new Date());
}

/** Inclusive list of local dates from start to end. */
export function eachDay(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  for (let d = startOfDay(start); !isAfter(d, end); d = addDays(d, 1)) out.push(d);
  return out;
}

/**
 * The coming weekend relative to `from`: Fri–Sun. On Sat/Sun it is the rest of the
 * current weekend (from today through Sunday).
 */
export function comingWeekend(from: Date): { start: Date; end: Date } {
  const d = startOfDay(from);
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  if (dow === 0) return { start: d, end: d };
  if (dow === 6) return { start: d, end: addDays(d, 1) };
  const toFri = (5 - dow + 7) % 7;
  const start = addDays(d, toFri);
  return { start, end: addDays(start, 2) };
}

export function isBlockedBetween(blocked: string[], start: Date, end: Date): boolean {
  const s = toISODate(start);
  const e = toISODate(end);
  return blocked.some((b) => b >= s && b <= e);
}

export { addDays, isAfter, isBefore, startOfDay };

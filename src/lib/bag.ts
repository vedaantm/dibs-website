import { addWeeks } from "date-fns";
import type { Item, PickupSpotId } from "@/data/types";
import { getItem } from "./catalog";
import { fromISODate, toISODate } from "./dates";
import { SEMESTER_WEEKS, quoteRental, type BestPlan, type QuoteLine, type Selection } from "./pricing";

/** Quote snapshot stored with a bag line (dates as ISO strings so it survives JSON). */
export type StoredQuote = {
  ok: boolean;
  error?: string;
  days: number;
  lines: QuoteLine[];
  subtotal: number;
  deposit: number;
  bestPlan: BestPlan;
  returnBy: string;
};

export type BagLine = {
  id: string;
  slug: string;
  start: string;
  end?: string;
  plan?: "semester";
  pickupSpotId: PickupSpotId;
  quote: StoredQuote;
  /** Set when re-validation finds the dates passed or booked. */
  issue?: string;
};

export function selectionOf(line: Pick<BagLine, "start" | "end" | "plan">): Selection {
  return line.plan === "semester"
    ? { plan: "semester", start: fromISODate(line.start) }
    : { start: fromISODate(line.start), end: fromISODate(line.end ?? line.start) };
}

/** Inclusive [start, end] ISO range a selection occupies. */
export function rangeOf(sel: Selection): [string, string] {
  const start = toISODate(sel.start);
  const end = "plan" in sel ? toISODate(addWeeks(sel.start, SEMESTER_WEEKS)) : toISODate(sel.end);
  return [start, end];
}

export function overlaps(a: [string, string], b: [string, string]): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

export function quoteLine(item: Item, sel: Selection, today?: Date): StoredQuote {
  const q = quoteRental(item, sel, { today });
  return {
    ok: q.ok,
    error: q.error,
    days: q.days,
    lines: q.lines,
    subtotal: q.subtotal,
    deposit: q.deposit,
    bestPlan: q.bestPlan,
    returnBy: toISODate(q.returnBy),
  };
}

/** Finds an existing line for the same item with overlapping dates. */
export function findOverlap(lines: BagLine[], slug: string, sel: Selection, exceptId?: string): BagLine | undefined {
  const r = rangeOf(sel);
  return lines.find((l) => l.slug === slug && l.id !== exceptId && overlaps(rangeOf(selectionOf(l)), r));
}

export const OVERLAP_ERROR = "Already in your bag for overlapping dates.";
export const STALE_ERROR = "These dates have passed — pick new ones";

/** Re-quotes every line against today's date and blocked dates, flagging stale or booked lines. */
export function revalidate(lines: BagLine[], today?: Date): BagLine[] {
  return lines
    .filter((l) => getItem(l.slug))
    .map((l) => {
      const item = getItem(l.slug)!;
      const quote = quoteLine(item, selectionOf(l), today);
      let issue: string | undefined;
      if (!quote.ok) issue = /passed/.test(quote.error ?? "") ? STALE_ERROR : quote.error;
      return { ...l, quote: quote.ok ? quote : { ...l.quote, ok: false, error: quote.error }, issue };
    });
}

export function bagTotals(lines: BagLine[]) {
  const valid = lines.filter((l) => !l.issue && l.quote.ok);
  return {
    count: lines.length,
    subtotal: valid.reduce((s, l) => s + l.quote.subtotal, 0),
    depositTotal: valid.reduce((s, l) => s + l.quote.deposit, 0),
    hasIssues: lines.some((l) => l.issue || !l.quote.ok),
  };
}

export function newLineId(): string {
  return `L${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

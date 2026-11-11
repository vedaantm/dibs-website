import type { PickupSpotId } from "@/data/types";
import { orderTotals, type OrderTotals } from "./fees";
import type { BagLine } from "./bag";

/** 9–10am … 9–10pm */
export const WINDOWS = Array.from({ length: 13 }, (_, i) => {
  const h = 9 + i;
  const fmt = (x: number) => `${x > 12 ? x - 12 : x}`;
  const suffix = (x: number) => (x >= 12 ? "pm" : "am");
  const start = fmt(h);
  const end = fmt(h + 1);
  const label = suffix(h) === suffix(h + 1) ? `${start}–${end}${suffix(h + 1)}` : `${start}${suffix(h)}–${end}${suffix(h + 1)}`;
  return { id: `${h}`, hour: h, label };
});

export function windowLabel(id: string | undefined): string {
  return WINDOWS.find((w) => w.id === id)?.label ?? "";
}

export type OrderLine = {
  slug: string;
  start: string;
  end?: string;
  plan?: "semester";
  returnBy: string;
  pickupSpotId: PickupSpotId;
  subtotal: number;
  deposit: number;
  quoteLines: string[];
  pickupWindow: string;
  returnWindow: string;
  dorm?: string;
};

export type OrderStatus = "confirmed" | "picked-up" | "returned";

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  phone: string;
  note?: string;
  lines: OrderLine[];
  totals: OrderTotals;
  depositHold: number;
  handoffCode: string;
  status: OrderStatus;
};

const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "DB-" + 6 unambiguous chars. */
export function makeOrderId(rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ID_CHARS[Math.floor(rand() * ID_CHARS.length)];
  return `DB-${s}`;
}

export function makeHandoffCode(rand: () => number = Math.random): string {
  return String(Math.floor(rand() * 9000) + 1000);
}

export type HandoffChoice = { pickupWindow: string; returnWindow: string; dorm?: string };

/** The key a bag line is grouped by for handoff: one spot, one pickup day, one return day. */
export function handoffKey(l: Pick<BagLine, "pickupSpotId" | "start" | "quote">): string {
  return `${l.pickupSpotId}|${l.start}|${l.quote.returnBy}`;
}

/** Groups bag lines into handoffs (same spot, pickup day and return day). */
export function groupHandoffs<T extends Pick<BagLine, "pickupSpotId" | "start" | "quote">>(lines: T[]): { key: string; lines: T[] }[] {
  const map = new Map<string, T[]>();
  for (const l of lines) map.set(handoffKey(l), [...(map.get(handoffKey(l)) ?? []), l]);
  return [...map.entries()].map(([key, ls]) => ({ key, lines: ls }));
}

export function buildOrder(input: {
  lines: BagLine[];
  choices: Record<string, HandoffChoice>;
  email: string;
  name: string;
  phone: string;
  note?: string;
  now: Date;
  rand?: () => number;
}): Order {
  const lines: OrderLine[] = input.lines.map((l) => {
    const c = input.choices[handoffKey(l)];
    return {
      slug: l.slug,
      start: l.start,
      end: l.end,
      plan: l.plan,
      returnBy: l.quote.returnBy,
      pickupSpotId: l.pickupSpotId,
      subtotal: l.quote.subtotal,
      deposit: l.quote.deposit,
      quoteLines: l.quote.lines.map((q) => q.label),
      pickupWindow: c?.pickupWindow ?? "",
      returnWindow: c?.returnWindow ?? "",
      dorm: c?.dorm || undefined,
    };
  });
  const totals = orderTotals(lines.map((l) => ({ subtotalCents: l.subtotal, depositCents: l.deposit })));
  return {
    id: makeOrderId(input.rand),
    createdAt: input.now.toISOString(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    phone: input.phone,
    note: input.note?.trim() || undefined,
    lines,
    totals,
    depositHold: totals.depositHoldCents,
    handoffCode: makeHandoffCode(input.rand),
    status: "confirmed",
  };
}

/** Earliest pickup and latest return across an order's lines (yyyy-MM-dd). */
export function orderSpan(o: Pick<Order, "lines">): { start: string; returnBy: string } {
  const starts = o.lines.map((l) => l.start).sort();
  const ends = o.lines.map((l) => l.returnBy).sort();
  return { start: starts[0], returnBy: ends[ends.length - 1] };
}

/** CONFIRMED before pickup, PICKED UP while out, RETURNED after the last return date. */
export function orderStatus(o: Pick<Order, "lines">, todayISO: string): OrderStatus {
  const { start, returnBy } = orderSpan(o);
  if (todayISO < start) return "confirmed";
  if (todayISO <= returnBy) return "picked-up";
  return "returned";
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  "picked-up": "Picked up",
  returned: "Returned",
};

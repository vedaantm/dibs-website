"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PickupSpotId } from "@/data/types";
import {
  OVERLAP_ERROR,
  bagTotals,
  findOverlap,
  newLineId,
  quoteLine,
  revalidate,
  type BagLine,
} from "@/lib/bag";
import { getItem } from "@/lib/catalog";
import { toISODate } from "@/lib/dates";
import type { Selection } from "@/lib/pricing";

export type { BagLine } from "@/lib/bag";

type Result = { ok: true; id: string } | { ok: false; error: string };

type BagState = {
  lines: BagLine[];
  add: (slug: string, sel: Selection, pickupSpotId: PickupSpotId) => Result;
  remove: (id: string) => void;
  updateDates: (id: string, sel: Selection) => Result;
  updatePickup: (id: string, pickupSpotId: PickupSpotId) => void;
  clear: () => void;
  revalidate: () => void;
};

function fields(sel: Selection) {
  return "plan" in sel
    ? { start: toISODate(sel.start), end: undefined, plan: "semester" as const }
    : { start: toISODate(sel.start), end: toISODate(sel.end), plan: undefined };
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (slug, sel, pickupSpotId) => {
        const item = getItem(slug);
        if (!item) return { ok: false, error: "That item is no longer listed." };
        const quote = quoteLine(item, sel);
        if (!quote.ok) return { ok: false, error: quote.error ?? "Those dates don't work." };
        if (findOverlap(get().lines, slug, sel)) return { ok: false, error: OVERLAP_ERROR };
        const id = newLineId();
        set((s) => ({ lines: [...s.lines, { id, slug, pickupSpotId, quote, ...fields(sel) }] }));
        return { ok: true, id };
      },
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      updateDates: (id, sel) => {
        const line = get().lines.find((l) => l.id === id);
        const item = line && getItem(line.slug);
        if (!line || !item) return { ok: false, error: "Line not found." };
        const quote = quoteLine(item, sel);
        if (!quote.ok) return { ok: false, error: quote.error ?? "Those dates don't work." };
        if (findOverlap(get().lines, line.slug, sel, id)) return { ok: false, error: OVERLAP_ERROR };
        set((s) => ({
          lines: s.lines.map((l) => (l.id === id ? { ...l, ...fields(sel), quote, issue: undefined } : l)),
        }));
        return { ok: true, id };
      },
      updatePickup: (id, pickupSpotId) =>
        set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, pickupSpotId } : l)) })),
      clear: () => set({ lines: [] }),
      revalidate: () => set((s) => ({ lines: revalidate(s.lines) })),
    }),
    {
      name: "dibs-bag-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // Re-check every line against today's date and blocked dates on load.
      onRehydrateStorage: () => (state) => state?.revalidate(),
    },
  ),
);

export function useBagCount() {
  return useBag((s) => s.lines.length);
}

export function useBagTotals() {
  const lines = useBag((s) => s.lines);
  return bagTotals(lines);
}

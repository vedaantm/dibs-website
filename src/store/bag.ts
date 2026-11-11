"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Minimal bag store. Phase 2 adds quotes, date edits and validation. */
export type BagLine = { id: string; slug: string };

type BagState = {
  lines: BagLine[];
  clear: () => void;
};

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      lines: [],
      clear: () => set({ lines: [] }),
    }),
    { name: "dibs-bag-v1", storage: createJSONStorage(() => localStorage) },
  ),
);

export function useBagCount() {
  return useBag((s) => s.lines.length);
}

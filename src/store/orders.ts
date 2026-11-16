"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cancelsRental, type SideCheck, type Side, type Stage } from "@/lib/handoff";
import type { Order } from "@/lib/order";

type OrdersState = {
  orders: Order[];
  add: (o: Order) => void;
  get: (id: string) => Order | undefined;
  /** Saves one side's condition check. A "Doesn't match" at pickup cancels and refunds in full. */
  recordCheck: (id: string, stage: Stage, side: Side, check: SideCheck) => void;
  clear: () => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      get: (id) => get().orders.find((o) => o.id === id),
      recordCheck: (id, stage, side, check) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id || o.cancelledAt) return o;
            const checks = { ...o.checks, [stage]: { ...o.checks?.[stage], [side]: check } };
            if (!cancelsRental(stage, check.verdict)) return { ...o, checks };
            return { ...o, checks, cancelledAt: check.at, refundCents: o.totals.dueTodayCents };
          }),
        })),
      clear: () => set({ orders: [] }),
    }),
    { name: "dibs-orders-v1", storage: createJSONStorage(() => localStorage), partialize: (s) => ({ orders: s.orders }) },
  ),
);

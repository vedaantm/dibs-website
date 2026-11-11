"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Order } from "@/lib/order";

type OrdersState = {
  orders: Order[];
  add: (o: Order) => void;
  get: (id: string) => Order | undefined;
  clear: () => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      get: (id) => get().orders.find((o) => o.id === id),
      clear: () => set({ orders: [] }),
    }),
    { name: "dibs-orders-v1", storage: createJSONStorage(() => localStorage), partialize: (s) => ({ orders: s.orders }) },
  ),
);

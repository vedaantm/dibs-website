"use client";

import { create } from "zustand";

type UIState = {
  menuOpen: boolean;
  searchOpen: boolean;
  bagOpen: boolean;
  /** Increments each time something is added, to replay the bag badge pulse. */
  bagPulse: number;
  openMenu: () => void;
  openSearch: () => void;
  openBag: () => void;
  closeAll: () => void;
  setMenu: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  setBag: (v: boolean) => void;
  pulseBag: () => void;
};

/** Transient UI state for the global overlays. Never persisted. */
export const useUI = create<UIState>((set) => ({
  menuOpen: false,
  searchOpen: false,
  bagOpen: false,
  bagPulse: 0,
  openMenu: () => set({ menuOpen: true, searchOpen: false, bagOpen: false }),
  openSearch: () => set({ searchOpen: true, menuOpen: false, bagOpen: false }),
  openBag: () => set({ bagOpen: true, menuOpen: false, searchOpen: false }),
  closeAll: () => set({ menuOpen: false, searchOpen: false, bagOpen: false }),
  setMenu: (v) => set({ menuOpen: v }),
  setSearch: (v) => set({ searchOpen: v }),
  setBag: (v) => set({ bagOpen: v }),
  pulseBag: () => set((s) => ({ bagPulse: s.bagPulse + 1 })),
}));

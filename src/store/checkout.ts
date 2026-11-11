"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { HandoffChoice } from "@/lib/order";

export type StepId = 1 | 2 | 3 | 4;

export type Choice = HandoffChoice & { dormOn?: boolean };

type CheckoutState = {
  step: StepId;
  /** Highest step completed; steps can't be skipped. */
  done: number;
  email: string;
  codeSent: boolean;
  verified: boolean;
  name: string;
  phone: string;
  idStatus: "none" | "uploaded" | "skipped";
  choices: Record<string, Choice>;
  note: string;
  photoAgree: boolean;
  termsAgree: boolean;
  /** Set by /checkout?demo=fill so steps pre-fill with the demo values. */
  demoFill: boolean;
  set: (patch: Partial<Omit<CheckoutState, "set" | "reset" | "complete" | "goTo" | "setChoice">>) => void;
  setChoice: (key: string, patch: Partial<Choice>) => void;
  complete: (step: StepId) => void;
  goTo: (step: StepId) => void;
  reset: () => void;
};

const initial = {
  step: 1 as StepId,
  done: 0,
  email: "",
  codeSent: false,
  verified: false,
  name: "",
  phone: "",
  idStatus: "none" as const,
  choices: {},
  note: "",
  photoAgree: false,
  termsAgree: false,
  demoFill: false,
};

/** Checkout progress survives a refresh (sessionStorage). Card fields are never stored here. */
export const useCheckout = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initial,
      set: (patch) => set(patch),
      setChoice: (key, patch) =>
        set((s) => ({
          choices: { ...s.choices, [key]: { ...(s.choices[key] ?? { pickupWindow: "", returnWindow: "" }), ...patch } },
        })),
      complete: (step) => set((s) => ({ done: Math.max(s.done, step), step: Math.min(4, step + 1) as StepId })),
      goTo: (step) => {
        if (step <= get().done + 1) set({ step });
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: "dibs-checkout-v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => {
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(initial) as (keyof typeof initial)[]) out[k] = s[k];
        return out as typeof initial;
      },
    },
  ),
);

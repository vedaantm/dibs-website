"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SEED_REPORTS } from "@/data/reports";
import type { CategorySlug, Condition } from "@/data/types";
import { isUnderReview, type LocalReview, type Report, type ReportReason } from "@/lib/trust";

// ---------- Profile: this browser's own verification + submitted listings ----------

export type SubmittedListing = {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  condition: Condition;
  retailValue: number;
  photoCount: number;
  /** ISO timestamp */
  submittedAt: string;
};

type ProfileState = {
  email: string | null;
  idVerified: boolean;
  listings: SubmittedListing[];
  verifyEmail: (email: string) => void;
  verifyId: () => void;
  submitListing: (l: Omit<SubmittedListing, "id" | "submittedAt">) => void;
  clear: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      email: null,
      idVerified: false,
      listings: [],
      verifyEmail: (email) => set({ email: email.trim().toLowerCase() }),
      verifyId: () => set({ idVerified: true }),
      submitListing: (l) =>
        set((s) => ({ listings: [{ ...l, id: `LS-${Date.now().toString(36).toUpperCase()}`, submittedAt: new Date().toISOString() }, ...s.listings] })),
      clear: () => set({ email: null, idVerified: false, listings: [] }),
    }),
    { name: "dibs-profile-v1", storage: createJSONStorage(() => localStorage) },
  ),
);

// ---------- Reports ----------

type ReportsState = {
  reports: Report[];
  add: (slug: string, reason: ReportReason, note: string) => void;
  clear: () => void;
};

export const useReports = create<ReportsState>()(
  persist(
    (set) => ({
      reports: [],
      add: (slug, reason, note) =>
        set((s) => ({
          reports: [
            ...s.reports,
            { id: `RP-${Date.now().toString(36)}`, slug, reason, note: note.trim() || undefined, createdAt: new Date().toISOString(), status: "open" },
          ],
        })),
      clear: () => set({ reports: [] }),
    }),
    { name: "dibs-reports-v1", storage: createJSONStorage(() => localStorage) },
  ),
);

/** Seed reports plus the ones filed in this browser. */
export function allReports(local: Report[]): Report[] {
  return [...SEED_REPORTS, ...local];
}

export function listingUnderReview(slug: string): boolean {
  return isUnderReview(slug, allReports(useReports.getState().reports));
}

// ---------- Reviews ----------

type ReviewsState = {
  reviews: LocalReview[];
  add: (r: LocalReview) => void;
  clear: () => void;
};

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: [],
      add: (r) => set((s) => ({ reviews: [r, ...s.reviews.filter((x) => !(x.slug === r.slug && x.orderId === r.orderId))] })),
      clear: () => set({ reviews: [] }),
    }),
    { name: "dibs-reviews-v1", storage: createJSONStorage(() => localStorage) },
  ),
);

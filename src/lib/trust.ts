import type { Lender } from "@/data/types";
import { orderStatus, type Order } from "./order";
import { verificationLevel, type VerificationLevel } from "./verification";

// ---------- Reports ----------

export const REPORT_REASONS = [
  { id: "not-as-pictured", label: "Not as pictured" },
  { id: "damaged", label: "Damaged" },
  { id: "unsafe", label: "Unsafe" },
  { id: "not-cleaned", label: "Not cleaned" },
  { id: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export type Report = {
  id: string;
  slug: string;
  reason: ReportReason;
  note?: string;
  /** ISO timestamp */
  createdAt: string;
  status: "open" | "closed";
};

/** Open reports at which a listing is pulled from booking until Dibs reviews it. */
export const UNDER_REVIEW_AT = 2;

export function openReportCount(slug: string, reports: Pick<Report, "slug" | "status">[]): number {
  return reports.filter((r) => r.slug === slug && r.status === "open").length;
}

export function isUnderReview(slug: string, reports: Pick<Report, "slug" | "status">[]): boolean {
  return openReportCount(slug, reports) >= UNDER_REVIEW_AT;
}

export const UNDER_REVIEW_ERROR = "This listing is under review and can't be booked right now.";

// ---------- Reviews ----------

export type LocalReview = {
  slug: string;
  orderId: string;
  author: string;
  rating: number;
  text: string;
  /** yyyy-MM-dd */
  date: string;
};

export const REVIEW_MAX = 500;

/** A rental is complete once it's returned (by date or by the return check) and wasn't cancelled. */
export function isCompleted(o: Pick<Order, "lines" | "checks" | "cancelledAt">, todayISO: string): boolean {
  return orderStatus(o, todayISO) === "returned";
}

/** Completed orders for this item that haven't been reviewed yet. Empty means no review allowed. */
export function reviewableOrders<O extends Pick<Order, "id" | "lines" | "checks" | "cancelledAt">>(
  slug: string,
  orders: O[],
  reviews: Pick<LocalReview, "slug" | "orderId">[],
  todayISO: string,
): O[] {
  return orders.filter(
    (o) =>
      o.lines.some((l) => l.slug === slug) &&
      isCompleted(o, todayISO) &&
      !reviews.some((r) => r.slug === slug && r.orderId === o.id),
  );
}

export function validateReview(rating: number | null, text: string): string | null {
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) return "Pick a rating from 1 to 5.";
  if (text.trim().length < 10) return "Write a sentence or two about the rental.";
  if (text.length > REVIEW_MAX) return `Keep it under ${REVIEW_MAX} characters.`;
  return null;
}

/** "Maya Kapoor" -> "Maya K." */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Renter";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// ---------- Lenders ----------

export function lenderLevel(l: Pick<Lender, "verified" | "idVerified" | "rentalsCompleted" | "rating">): VerificationLevel {
  return verificationLevel({ emailVerified: l.verified, idVerified: l.idVerified, rentalsCompleted: l.rentalsCompleted, rating: l.rating });
}

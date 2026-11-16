import type { Report } from "@/lib/trust";

/**
 * Open reports already on file (pilot preview sample data). One more report on either
 * listing puts it at two, which pulls it from booking until Dibs reviews it.
 */
export const SEED_REPORTS: Report[] = [
  { id: "seed-1", slug: "inflatable-t-rex", reason: "damaged", note: "Fan cuts out after a few minutes.", createdAt: "2026-11-02T19:40:00.000Z", status: "open" },
  { id: "seed-2", slug: "gosports-cornhole", reason: "not-as-pictured", note: "Only six bags, listing says eight.", createdAt: "2026-11-08T15:12:00.000Z", status: "open" },
];

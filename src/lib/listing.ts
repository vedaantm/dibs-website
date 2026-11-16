import type { CategorySlug, Condition } from "@/data/types";
import { ID_REQUIRED_RETAIL, canList, type VerificationLevel } from "./verification";

/** The only conditions Dibs accepts. No "Fair", no "Broken". */
export const CONDITION_SCALE: { value: Condition; label: string; guide: string }[] = [
  { value: "Like new", label: "Like new", guide: "No visible wear. Works like the day it was bought." },
  { value: "Excellent", label: "Excellent", guide: "Light wear you'd notice up close. Fully working." },
  { value: "Good", label: "Good", guide: "Visible wear: scuffs, highlighting, a loose thread. Fully working." },
];

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 6;

export function needsCleaning(cat: CategorySlug): boolean {
  return cat === "formal" || cat === "costumes";
}

export function isElectronics(cat: CategorySlug): boolean {
  return cat === "tech";
}

export type ListingDraft = {
  category: CategorySlug;
  name: string;
  brand: string;
  retailValue: number;
  /** Free text from the form, checked against the scale. */
  condition: string;
  photoCount: number;
  /** Index of the photo marked as the wear/damage close-up, or null. */
  closeUpIndex: number | null;
  ratesSet: number;
  pickupSpots: number;
  cleaned: boolean;
  tested: boolean;
  /** "What's included" lines (electronics). */
  included: string[];
};

export type CheckId =
  | "basics"
  | "condition"
  | "photos"
  | "close-up"
  | "rates"
  | "pickup"
  | "cleaned"
  | "tested"
  | "included"
  | "email"
  | "id";

export type CheckItem = { id: CheckId; label: string; met: boolean };

/** Every listing standard that applies to this draft, in the order the form asks for them. */
export function listingChecklist(d: ListingDraft, level: VerificationLevel): CheckItem[] {
  const list: CheckItem[] = [
    { id: "basics", label: "Name, brand and retail value", met: Boolean(d.name.trim() && d.brand.trim() && d.retailValue > 0) },
    { id: "condition", label: "Condition from the Dibs scale", met: CONDITION_SCALE.some((c) => c.value === d.condition) },
    { id: "photos", label: `At least ${MIN_PHOTOS} photos`, met: d.photoCount >= MIN_PHOTOS },
    {
      id: "close-up",
      label: "One photo marked as a close-up of wear",
      met: d.closeUpIndex !== null && d.closeUpIndex >= 0 && d.closeUpIndex < d.photoCount,
    },
    { id: "rates", label: "At least one rate", met: d.ratesSet > 0 },
    { id: "pickup", label: "At least one pickup spot", met: d.pickupSpots > 0 },
  ];
  if (needsCleaning(d.category)) list.push({ id: "cleaned", label: "Cleaned before each rental", met: d.cleaned });
  if (isElectronics(d.category)) {
    list.push({ id: "tested", label: "Tested and fully working", met: d.tested });
    list.push({ id: "included", label: "What's included, listed", met: d.included.some((l) => l.trim().length > 0) });
  }
  list.push({ id: "email", label: "Verified @nyu.edu email", met: level !== "none" });
  if (d.retailValue >= ID_REQUIRED_RETAIL) {
    list.push({ id: "id", label: `Student ID verified ($${ID_REQUIRED_RETAIL}+ items)`, met: canList(level, d.retailValue) });
  }
  return list;
}

export function listingReady(checks: CheckItem[]): boolean {
  return checks.every((c) => c.met);
}

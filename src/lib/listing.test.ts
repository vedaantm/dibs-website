import { describe, expect, it } from "vitest";
import { ITEMS } from "@/data/items";
import { CONDITION_SCALE, listingChecklist, listingReady, type CheckId, type ListingDraft } from "./listing";

const textbook: ListingDraft = {
  category: "textbooks",
  name: "Calculus, 9th Edition",
  brand: "Cengage",
  retailValue: 90,
  condition: "Good",
  photoCount: 3,
  closeUpIndex: 2,
  ratesSet: 1,
  pickupSpots: 1,
  cleaned: false,
  tested: false,
  included: [""],
};

const ids = (d: ListingDraft, level = "email" as const) => listingChecklist(d, level).map((c) => c.id);
const unmet = (d: ListingDraft, level: Parameters<typeof listingChecklist>[1] = "email"): CheckId[] =>
  listingChecklist(d, level)
    .filter((c) => !c.met)
    .map((c) => c.id);

describe("listing checklist", () => {
  it("passes a complete textbook listing from an email-verified student", () => {
    expect(unmet(textbook)).toEqual([]);
    expect(listingReady(listingChecklist(textbook, "email"))).toBe(true);
  });

  it("needs at least 3 photos", () => {
    expect(unmet({ ...textbook, photoCount: 2, closeUpIndex: 1 })).toEqual(["photos"]);
  });

  it("needs one photo marked as the wear close-up, and it must still exist", () => {
    expect(unmet({ ...textbook, closeUpIndex: null })).toEqual(["close-up"]);
    expect(unmet({ ...textbook, closeUpIndex: 3 })).toEqual(["close-up"]);
  });

  it("only accepts the three grades on the scale", () => {
    expect(CONDITION_SCALE.map((c) => c.value)).toEqual(["Like new", "Excellent", "Good"]);
    expect(unmet({ ...textbook, condition: "Fair" })).toEqual(["condition"]);
    expect(unmet({ ...textbook, condition: "Broken" })).toEqual(["condition"]);
  });

  it("asks formal and costumes for the cleaning confirmation only", () => {
    expect(ids(textbook)).not.toContain("cleaned");
    expect(unmet({ ...textbook, category: "formal" })).toEqual(["cleaned"]);
    expect(unmet({ ...textbook, category: "costumes", cleaned: true })).toEqual([]);
  });

  it("asks electronics for tested + what's included", () => {
    expect(ids(textbook)).not.toContain("tested");
    expect(unmet({ ...textbook, category: "tech" })).toEqual(["tested", "included"]);
    expect(unmet({ ...textbook, category: "tech", tested: true, included: ["  "] })).toEqual(["included"]);
    expect(unmet({ ...textbook, category: "tech", tested: true, included: ["Body", ""] })).toEqual([]);
  });

  it("needs a verified email for anything, and an ID check from $100", () => {
    expect(unmet(textbook, "none")).toEqual(["email"]);
    expect(ids(textbook)).not.toContain("id");
    expect(unmet({ ...textbook, retailValue: 100 }, "email")).toEqual(["id"]);
    expect(unmet({ ...textbook, retailValue: 100 }, "id")).toEqual([]);
  });

  it("blocks submit while anything is unmet", () => {
    const empty: ListingDraft = { ...textbook, name: "", photoCount: 0, closeUpIndex: null, ratesSet: 0, pickupSpots: 0 };
    expect(listingReady(listingChecklist(empty, "none"))).toBe(false);
    expect(unmet(empty, "none")).toEqual(["basics", "photos", "close-up", "rates", "pickup", "email"]);
  });

  it("sample listings all use a grade from the scale", () => {
    for (const i of ITEMS) expect(CONDITION_SCALE.map((c) => c.value)).toContain(i.condition);
  });
});

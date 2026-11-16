import { describe, expect, it } from "vitest";
import { ITEMS } from "@/data/items";
import { LENDERS } from "@/data/lenders";
import { lenderLevel } from "./trust";
import { atLeast, canList, requiredLevelToList, trustedGap, verificationLevel, type VerificationFacts } from "./verification";

const base: VerificationFacts = { emailVerified: true, idVerified: true, rentalsCompleted: 3, rating: 4.5 };

describe("verificationLevel", () => {
  it("is none without a verified email, whatever else is true", () => {
    expect(verificationLevel({ ...base, emailVerified: false })).toBe("none");
  });

  it("is EMAIL VERIFIED with an email but no ID check", () => {
    expect(verificationLevel({ ...base, idVerified: false })).toBe("email");
  });

  it("is TRUSTED LENDER at exactly 3 rentals and a 4.5 rating", () => {
    expect(verificationLevel(base)).toBe("trusted");
  });

  it("stays ID VERIFIED with 2 rentals, a 4.4 rating or no rating", () => {
    expect(verificationLevel({ ...base, rentalsCompleted: 2 })).toBe("id");
    expect(verificationLevel({ ...base, rating: 4.4 })).toBe("id");
    expect(verificationLevel({ ...base, rating: null })).toBe("id");
  });

  it("never makes someone trusted without an ID check, however good their record", () => {
    expect(verificationLevel({ ...base, idVerified: false, rentalsCompleted: 50, rating: 5 })).toBe("email");
  });
});

describe("listing permissions", () => {
  it("needs ID VERIFIED from $100 retail", () => {
    expect(requiredLevelToList(99.99)).toBe("email");
    expect(requiredLevelToList(100)).toBe("id");
    expect(canList("email", 99)).toBe(true);
    expect(canList("email", 100)).toBe(false);
    expect(canList("id", 1695)).toBe(true);
    expect(canList("trusted", 1695)).toBe(true);
    expect(canList("none", 20)).toBe(false);
  });

  it("orders the levels", () => {
    expect(atLeast("trusted", "id")).toBe(true);
    expect(atLeast("email", "id")).toBe(false);
  });

  it("lists what's missing for trusted", () => {
    expect(trustedGap(base)).toEqual([]);
    expect(trustedGap({ emailVerified: true, idVerified: false, rentalsCompleted: 2, rating: null })).toEqual([
      "Verify your student ID",
      "1 more completed rental as a lender",
      "A 4.5+ lender rating",
    ]);
  });
});

describe("sample lenders", () => {
  it("every listing's lender is allowed to list it", () => {
    for (const item of ITEMS) {
      const lender = LENDERS.find((l) => l.id === item.lenderId)!;
      expect(canList(lenderLevel(lender), item.retailValue), item.slug).toBe(true);
    }
  });

  it("shows more than one level across the pilot", () => {
    const levels = new Set(LENDERS.map(lenderLevel));
    expect(levels).toContain("trusted");
    expect(levels).toContain("id");
  });
});

import { describe, expect, it } from "vitest";
import { ITEMS } from "@/data/items";
import { getItem, getNewest, getRelated, lowestRate, searchItems } from "./catalog";

const slugs = (list: { slug: string }[]) => list.map((i) => i.slug);

describe("catalog data", () => {
  it("has exactly 35 items with unique slugs", () => {
    expect(ITEMS).toHaveLength(35);
    expect(new Set(slugs(ITEMS)).size).toBe(35);
  });

  it("applies no deposit under $100 retail", () => {
    for (const i of ITEMS) {
      if (i.retailValue < 100) expect(i.deposit).toBe(0);
      else expect(i.deposit).toBeGreaterThan(0);
    }
  });

  it("marks formal and costumes as cleaned between rentals", () => {
    for (const i of ITEMS) {
      const seasonal = i.categorySlug === "formal" || i.categorySlug === "costumes";
      expect(Boolean(i.cleanedBetweenRentals)).toBe(seasonal);
    }
  });
});

describe("searchItems", () => {
  it("is case-insensitive on names", () => {
    expect(slugs(searchItems("CALCULUS"))).toContain("stewart-calculus-9e");
  });

  it("matches brand", () => {
    expect(slugs(searchItems("suitsupply")).sort()).toEqual(["suitsupply-havana-navy", "suitsupply-lazio-tuxedo"]);
  });

  it("matches category and subcategory", () => {
    expect(searchItems("textbooks")).toHaveLength(5);
    expect(slugs(searchItems("snow"))).toEqual(
      expect.arrayContaining(["burton-ripcord-154", "rossignol-experience-80", "tnf-freedom-insulated"]),
    );
  });

  it("matches tags", () => {
    expect(slugs(searchItems("orgo"))).toEqual(["klein-organic-chemistry-4e"]);
  });

  it("ignores punctuation, so ti84 and TI-84 both work", () => {
    expect(slugs(searchItems("ti84"))).toContain("ti-84-plus-ce");
    expect(slugs(searchItems("TI-84"))).toContain("ti-84-plus-ce");
  });

  it("requires every word to match", () => {
    expect(slugs(searchItems("navy suit"))).toEqual(["suitsupply-havana-navy"]);
    expect(searchItems("navy spaceship")).toEqual([]);
  });

  it("returns nothing for blank input", () => {
    expect(searchItems("   ")).toEqual([]);
  });

  it("covers every popular search", () => {
    for (const q of ["Calculus", "Biology", "TI-84", "Ski", "Cooler", "Tuxedo"]) {
      expect(searchItems(q).length, q).toBeGreaterThan(0);
    }
  });
});

describe("lowestRate", () => {
  it("uses the day rate when offered", () => {
    expect(lowestRate(getItem("burton-ripcord-154")!)).toEqual({ amount: 24, unit: "day" });
  });

  it("uses the week rate for textbooks", () => {
    expect(lowestRate(getItem("myers-psychology-13e")!)).toEqual({ amount: 9, unit: "week" });
  });

  it("falls back to weekend, then semester", () => {
    const base = getItem("burton-ripcord-154")!;
    expect(lowestRate({ ...base, rates: { weekend: 40, semester: 90 } })).toEqual({ amount: 40, unit: "weekend" });
    expect(lowestRate({ ...base, rates: { semester: 90 } })).toEqual({ amount: 90, unit: "semester" });
  });
});

describe("helpers", () => {
  it("getNewest sorts by listedAt desc", () => {
    const newest = getNewest(8);
    expect(newest).toHaveLength(8);
    for (let i = 1; i < newest.length; i++) expect(newest[i - 1].listedAt >= newest[i].listedAt).toBe(true);
  });

  it("getRelated excludes the item and prefers its category", () => {
    const item = getItem("canon-eos-r50-kit")!;
    const rel = getRelated(item, 4);
    expect(rel).toHaveLength(4);
    expect(slugs(rel)).not.toContain(item.slug);
    expect(rel[0].categorySlug).toBe("tech");
  });
});

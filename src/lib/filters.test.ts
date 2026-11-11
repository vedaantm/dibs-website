import { describe, expect, it } from "vitest";
import { ITEMS } from "@/data/items";
import { comingWeekend, toISODate } from "./dates";
import { activeTags, applyFilters, emptyFilters, filtersToParams, parseFilters, sortItems } from "./filters";
import { perDayPrice } from "./catalog";

const p = (q: string) => new URLSearchParams(q);
const now = new Date(2026, 10, 11); // Wed Nov 11 2026

describe("parseFilters / filtersToParams", () => {
  it("round-trips and drops junk", () => {
    const f = parseFilters(p("cat=sports,nope&rate=week&min=5&max=20&spot=bobst,mars&cond=Good&weekend=1&sort=price-asc"));
    expect(f.cats).toEqual(["sports"]);
    expect(f.spots).toEqual(["bobst"]);
    expect(f.min).toBe(5);
    expect(f.max).toBe(20);
    expect(f.weekend).toBe(true);
    expect(f.sort).toBe("price-asc");
    expect(filtersToParams(f).toString()).toBe(
      "cat=sports&rate=week&min=5&max=20&spot=bobst&cond=Good&weekend=1&sort=price-asc",
    );
  });

  it("keeps unrelated params like q and edit", () => {
    const out = filtersToParams(emptyFilters(), p("q=calc&edit=finals-week&cat=tech"));
    expect(out.get("q")).toBe("calc");
    expect(out.get("edit")).toBe("finals-week");
    expect(out.get("cat")).toBeNull();
  });

  it("treats range ends at the bounds as unset", () => {
    const f = parseFilters(p("min=0&max=50"));
    expect(f.min).toBeUndefined();
    expect(f.max).toBeUndefined();
  });

  it("defaults sort to newest", () => {
    expect(parseFilters(p("sort=bogus")).sort).toBe("newest");
  });
});

describe("applyFilters", () => {
  it("filters by category, rate type and price per day", () => {
    const f = { ...emptyFilters(), cats: ["textbooks" as const] };
    expect(applyFilters(ITEMS, f, now)).toHaveLength(5);
    const sem = applyFilters(ITEMS, { ...emptyFilters(), rates: ["semester"] }, now);
    expect(sem.every((i) => i.rates.semester !== undefined)).toBe(true);
    const cheap = applyFilters(ITEMS, { ...emptyFilters(), max: 10 }, now);
    expect(cheap.every((i) => perDayPrice(i) <= 10)).toBe(true);
  });

  it("excludes items booked this coming weekend", () => {
    const wk = comingWeekend(now);
    expect(toISODate(wk.start)).toBe("2026-11-13");
    const avail = applyFilters(ITEMS, { ...emptyFilters(), weekend: true }, now);
    const slugs = avail.map((i) => i.slug);
    expect(slugs).not.toContain("suitsupply-havana-navy"); // blocked Nov 14-15
    expect(slugs).toContain("burton-ripcord-154");
  });
});

describe("comingWeekend", () => {
  it("handles Fri, Sat and Sun", () => {
    expect(toISODate(comingWeekend(new Date(2026, 10, 13)).start)).toBe("2026-11-13");
    const sat = comingWeekend(new Date(2026, 10, 14));
    expect([toISODate(sat.start), toISODate(sat.end)]).toEqual(["2026-11-14", "2026-11-15"]);
    const sun = comingWeekend(new Date(2026, 10, 15));
    expect([toISODate(sun.start), toISODate(sun.end)]).toEqual(["2026-11-15", "2026-11-15"]);
  });
});

describe("sortItems", () => {
  it("sorts by price both ways", () => {
    const asc = sortItems(ITEMS, "price-asc").map(perDayPrice);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = sortItems(ITEMS, "price-desc").map(perDayPrice);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("sorts deposit low-high with no-deposit items first", () => {
    const sorted = sortItems(ITEMS, "deposit-asc");
    expect(sorted[0].deposit).toBe(0);
  });
});

describe("activeTags", () => {
  it("labels price ranges like the toolbar", () => {
    expect(activeTags({ ...emptyFilters(), max: 20 })[0].label).toBe("Under $20 / day");
    expect(activeTags({ ...emptyFilters(), min: 5, max: 20 })[0].label).toBe("$5–$20 / day");
  });

  it("removes a single tag", () => {
    const f = { ...emptyFilters(), spots: ["bobst" as const, "kimmel" as const] };
    const [first] = activeTags(f);
    expect(first.remove(f).spots).toEqual(["kimmel"]);
  });
});

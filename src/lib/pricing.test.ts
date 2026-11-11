import { describe, expect, it } from "vitest";
import type { Item } from "@/data/types";
import { ITEMS } from "@/data/items";
import { getItem } from "./catalog";
import { toISODate } from "./dates";
import {
  describeBlocked,
  isWeekendRange,
  nextAvailableSemester,
  nextAvailableStart,
  nextAvailableWeekend,
  quoteRental,
} from "./pricing";

// Wed Nov 11 2026 — the catalog snapshot date.
const TODAY = new Date(2026, 10, 11);
const d = (m: number, day: number) => new Date(2026, m - 1, day);
const q = (item: Item, start: Date, end: Date) => quoteRental(item, { start, end }, { today: TODAY });

const burton = getItem("burton-ripcord-154")!; // day 24, weekend 55, week 110
const canon = getItem("canon-eos-r50-kit")!; // day 35, weekend 75, week 150
const bio = getItem("campbell-biology-12e")!; // week 12, semester 55

/** Item with no blocked dates for isolated math tests. */
const clean = (item: Item, patch: Partial<Item> = {}): Item => ({ ...item, blockedDates: [], ...patch });

describe("isWeekendRange", () => {
  it("accepts Fri–Sat, Fri–Sun, Sat, Sat–Sun", () => {
    expect(isWeekendRange(d(11, 13), d(11, 14))).toBe(true);
    expect(isWeekendRange(d(11, 13), d(11, 15))).toBe(true);
    expect(isWeekendRange(d(11, 14), d(11, 14))).toBe(true);
    expect(isWeekendRange(d(11, 14), d(11, 15))).toBe(true);
  });
  it("rejects Fri only, Thu–Sun, Sun–Mon and Fri–next Sun", () => {
    expect(isWeekendRange(d(11, 13), d(11, 13))).toBe(false);
    expect(isWeekendRange(d(11, 12), d(11, 15))).toBe(false);
    expect(isWeekendRange(d(11, 15), d(11, 16))).toBe(false);
    expect(isWeekendRange(d(11, 13), d(11, 22))).toBe(false);
  });
});

describe("quoteRental — day / weekend / week math", () => {
  it("counts calendar days inclusive (Fri→Sun = 3)", () => {
    expect(q(burton, d(11, 13), d(11, 15)).days).toBe(3);
  });

  it("uses the weekend rate for Fri–Sun on the Burton ($55)", () => {
    const r = q(burton, d(11, 13), d(11, 15));
    expect(r.ok).toBe(true);
    expect(r.bestPlan).toBe("weekend");
    expect(r.subtotal).toBe(5500);
    expect(r.lines[0].label).toBe("1 weekend × $55");
  });

  it("still picks the cheaper day rate for a Sat-only rental", () => {
    const r = q(burton, d(11, 14), d(11, 14));
    expect(r.bestPlan).toBe("day");
    expect(r.subtotal).toBe(2400);
  });

  it("prices 9 days on the Canon as 1 week + 2 days ($220)", () => {
    const r = q(clean(canon), d(11, 16), d(11, 24));
    expect(r.days).toBe(9);
    expect(r.bestPlan).toBe("mixed");
    expect(r.subtotal).toBe(22000);
    expect(r.lines.map((l) => l.label)).toEqual(["1 week × $150", "2 days × $35"]);
  });

  it("rounds leftover days up to another week when cheaper", () => {
    // 12 days on the Burton: 1w+5d = 110+120 = 230 vs 2w = 220
    const r = q(clean(burton), d(11, 16), d(11, 27));
    expect(r.bestPlan).toBe("week");
    expect(r.subtotal).toBe(22000);
    expect(r.lines[0].label).toBe("2 weeks × $110");
  });

  it("uses all-day pricing for short weekday rentals", () => {
    const r = q(burton, d(11, 16), d(11, 18));
    expect(r.subtotal).toBe(3 * 2400);
    expect(r.lines[0].label).toBe("3 days × $24");
  });

  it("rounds 5 weekdays up to 1 week when that is cheaper", () => {
    const r = q(burton, d(11, 16), d(11, 20)); // 5 × 24 = 120 > 110
    expect(r.subtotal).toBe(11000);
    expect(r.bestPlan).toBe("week");
  });

  it("returns by the end date", () => {
    expect(toISODate(q(burton, d(11, 13), d(11, 15)).returnBy)).toBe("2026-11-15");
  });
});

describe("quoteRental — textbooks and semester", () => {
  it("bills a 3-day textbook rental as 1 week", () => {
    const r = q(bio, d(11, 16), d(11, 18));
    expect(r.ok).toBe(true);
    expect(r.subtotal).toBe(1200);
    expect(r.lines[0].label).toBe("1 week × $12");
  });

  it("bills 8 textbook days as 2 weeks", () => {
    expect(q(bio, d(11, 16), d(11, 23)).subtotal).toBe(2400);
  });

  it("prices the semester plan at the semester rate with return 15 weeks later", () => {
    const r = quoteRental(bio, { plan: "semester", start: d(11, 16) }, { today: TODAY });
    expect(r.ok).toBe(true);
    expect(r.bestPlan).toBe("semester");
    expect(r.subtotal).toBe(5500);
    expect(toISODate(r.returnBy)).toBe("2027-03-01");
    expect(r.deposit).toBe(6000);
  });

  it("rejects semester on items without a semester rate", () => {
    expect(quoteRental(burton, { plan: "semester", start: d(11, 16) }, { today: TODAY }).ok).toBe(false);
  });

  it("rejects a semester that overlaps a booking", () => {
    const r = quoteRental(bio, { plan: "semester", start: d(11, 12) }, { today: TODAY });
    expect(r.ok).toBe(false);
    expect(r.error).toBe("Booked Nov 12–13. Try a later start.");
  });
});

describe("quoteRental — rejections", () => {
  it("rejects ranges with blocked dates and names them", () => {
    const r = q(burton, d(11, 26), d(11, 30)); // blocked 27–29
    expect(r.ok).toBe(false);
    expect(r.error).toBe("Booked Nov 27–29. Try other dates.");
  });

  it("formats blocked runs across months and singles", () => {
    expect(describeBlocked(["2026-11-30", "2026-12-01"])).toBe("Nov 30–Dec 1");
    expect(describeBlocked(["2026-11-21", "2026-11-22", "2026-12-05"])).toBe("Nov 21–22, Dec 5");
  });

  it("rejects start dates in the past but allows today", () => {
    expect(q(burton, d(11, 10), d(11, 12)).error).toMatch(/passed/);
    expect(q(clean(burton), d(11, 11), d(11, 12)).ok).toBe(true);
  });

  it("caps ranges at 30 days unless semester", () => {
    expect(q(clean(burton), d(11, 16), d(12, 15)).ok).toBe(true); // 30 days
    const r = q(clean(burton), d(11, 16), d(12, 16)); // 31 days
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/30 days/);
    expect(q(clean(bio), d(11, 16), d(12, 16)).error).toMatch(/semester plan/);
  });

  it("respects minDays", () => {
    const r = q(clean(burton, { minDays: 3 }), d(11, 16), d(11, 17));
    expect(r.ok).toBe(false);
    expect(r.error).toBe("Minimum rental is 3 days.");
  });

  it("rejects an end before the start", () => {
    expect(q(burton, d(11, 18), d(11, 16)).ok).toBe(false);
  });
});

describe("quoteRental — money", () => {
  it("keeps cents as integers for fractional rates", () => {
    const odd = clean(burton, { rates: { day: 7.33 } });
    const r = q(odd, d(11, 16), d(11, 18));
    expect(r.subtotal).toBe(2199);
    expect(Number.isInteger(r.subtotal)).toBe(true);
  });

  it("returns no deposit for items under $100", () => {
    const instax = getItem("fujifilm-instax-mini-12")!;
    expect(q(instax, d(11, 16), d(11, 17)).deposit).toBe(0);
    expect(q(burton, d(11, 13), d(11, 15)).deposit).toBe(15000);
  });

  it("quotes every catalog item for its next free week without errors", () => {
    for (const item of ITEMS) {
      const start = nextAvailableStart(item, TODAY, 7)!;
      const r = quoteRental(item, { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6) }, { today: TODAY });
      expect(r.ok, item.slug).toBe(true);
    }
  });
});

describe("availability helpers", () => {
  it("finds the next free Fri–Sun", () => {
    const suit = getItem("suitsupply-havana-navy")!; // blocked Nov 14–15
    const wk = nextAvailableWeekend(suit, TODAY)!;
    expect(toISODate(wk.start)).toBe("2026-11-20");
    expect(toISODate(wk.end)).toBe("2026-11-22");
  });

  it("finds the next semester start after bookings", () => {
    expect(toISODate(nextAvailableSemester(bio, TODAY)!)).toBe("2026-11-14");
  });
});

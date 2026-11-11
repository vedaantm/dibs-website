import { describe, expect, it } from "vitest";
import { ITEMS } from "@/data/items";
import { estimateMonthly, median } from "./estimator";

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe("estimateMonthly", () => {
  it("uses the weekend median and tiered fee for sports", () => {
    // sports weekend rates: 55, 65, 20, 18, 18, 14 -> median 19; retail median 225 -> 8%
    const e = estimateMonthly(ITEMS, "sports", 2);
    expect(e.period).toBe("weekend");
    expect(e.medianRate).toBe(19);
    expect(e.feeRate).toBe(0.08);
    expect(e.grossCents).toBe(3800);
    expect(e.feeCents).toBe(304);
    expect(e.netCents).toBe(3496);
  });

  it("falls back to weeks for textbooks", () => {
    const e = estimateMonthly(ITEMS, "textbooks", 4);
    expect(e.period).toBe("week");
    expect(e.medianRate).toBe(12);
    expect(e.netCents).toBe(4800 - Math.round(4800 * 0.08));
  });

  it("is zero at zero rentals", () => {
    expect(estimateMonthly(ITEMS, "tech", 0).netCents).toBe(0);
  });
});

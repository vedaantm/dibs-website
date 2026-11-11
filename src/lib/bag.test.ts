import { describe, expect, it } from "vitest";
import { getItem } from "./catalog";
import { STALE_ERROR, bagTotals, findOverlap, quoteLine, rangeOf, revalidate, type BagLine } from "./bag";

const TODAY = new Date(2026, 10, 11);
const d = (m: number, day: number) => new Date(2026, m - 1, day);

function line(id: string, slug: string, start: string, end: string): BagLine {
  const item = getItem(slug)!;
  const sel = { start: new Date(`${start}T00:00:00`), end: new Date(`${end}T00:00:00`) };
  return { id, slug, start, end, pickupSpotId: item.pickupSpotIds[0], quote: quoteLine(item, sel, TODAY) };
}

describe("bag helpers", () => {
  it("detects overlapping dates for the same item only", () => {
    const lines = [line("a", "burton-ripcord-154", "2026-11-13", "2026-11-15")];
    expect(findOverlap(lines, "burton-ripcord-154", { start: d(11, 15), end: d(11, 17) })).toBeDefined();
    expect(findOverlap(lines, "burton-ripcord-154", { start: d(11, 16), end: d(11, 17) })).toBeUndefined();
    expect(findOverlap(lines, "canon-eos-r50-kit", { start: d(11, 13), end: d(11, 15) })).toBeUndefined();
    expect(findOverlap(lines, "burton-ripcord-154", { start: d(11, 13), end: d(11, 15) }, "a")).toBeUndefined();
  });

  it("treats semester plans as 15-week ranges", () => {
    expect(rangeOf({ plan: "semester", start: d(11, 16) })).toEqual(["2026-11-16", "2027-03-01"]);
  });

  it("flags lines whose dates have passed", () => {
    const lines = [line("a", "burton-ripcord-154", "2026-11-13", "2026-11-15")];
    const later = revalidate(lines, new Date(2026, 10, 20));
    expect(later[0].issue).toBe(STALE_ERROR);
    expect(revalidate(lines, TODAY)[0].issue).toBeUndefined();
  });

  it("totals only valid lines and keeps the deposit separate", () => {
    const lines = [line("a", "burton-ripcord-154", "2026-11-13", "2026-11-15"), line("b", "campbell-biology-12e", "2026-11-16", "2026-11-18")];
    const t = bagTotals(lines);
    expect(t.count).toBe(2);
    expect(t.subtotal).toBe(5500 + 1200);
    expect(t.depositTotal).toBe(15000 + 6000);
    const stale = bagTotals(revalidate(lines, new Date(2026, 10, 17)));
    expect(stale.hasIssues).toBe(true);
  });
});

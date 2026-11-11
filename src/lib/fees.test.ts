import { describe, expect, it } from "vitest";
import { ITEMS } from "@/data/items";
import {
  LATE_FEE_POLICY,
  RENTER_FEE_CENTS,
  depositHoldCents,
  feeRateForRetail,
  lateFeePerDayCents,
  lenderFeeCents,
  lenderFeeRate,
  orderTotals,
  salesTaxCents,
} from "./fees";

describe("lender fee tiers", () => {
  it("is 5% under $200, 8% for $200–499, 10% for $500+", () => {
    expect(feeRateForRetail(0)).toBe(0.05);
    expect(feeRateForRetail(199.99)).toBe(0.05);
    expect(feeRateForRetail(200)).toBe(0.08);
    expect(feeRateForRetail(499)).toBe(0.08);
    expect(feeRateForRetail(500)).toBe(0.1);
    expect(feeRateForRetail(1695)).toBe(0.1);
  });

  it("charges the fee on the rental subtotal, rounded to the cent", () => {
    expect(lenderFeeCents(5500, { retailValue: 500 })).toBe(550);
    expect(lenderFeeCents(1234, { retailValue: 250 })).toBe(99); // 98.72
    expect(lenderFeeCents(1000, { retailValue: 150 })).toBe(50);
  });

  it("is free on the lender's first rental", () => {
    expect(lenderFeeCents(5500, { retailValue: 500 }, true)).toBe(0);
  });

  it("tiers every catalog item", () => {
    for (const i of ITEMS) expect([0.05, 0.08, 0.1]).toContain(lenderFeeRate(i));
  });
});

describe("renter charges", () => {
  it("has no renter fee and no membership", () => {
    expect(RENTER_FEE_CENTS).toBe(0);
  });

  it("charges NYC sales tax 8.875% rounded to the cent", () => {
    expect(salesTaxCents(5500)).toBe(488); // 488.125
    expect(salesTaxCents(22000)).toBe(1953); // 1952.5 -> 1953
    expect(salesTaxCents(1200)).toBe(107); // 106.5 -> 107
  });

  it("sums deposits as a hold that is never added to the total", () => {
    expect(depositHoldCents([150, 80, 0])).toBe(23000);
    const t = orderTotals([
      { subtotalCents: 5500, depositCents: 15000 },
      { subtotalCents: 1200, depositCents: 6000 },
    ]);
    expect(t.subtotalCents).toBe(6700);
    expect(t.taxCents).toBe(595); // 594.6
    expect(t.dueTodayCents).toBe(6700 + 595);
    expect(t.depositHoldCents).toBe(21000);
    expect(t.feeCents).toBe(0);
  });

  it("states the late fee policy and computes 1.5× the day rate", () => {
    expect(LATE_FEE_POLICY).toBe("1.5× the day rate per late day, taken from the deposit.");
    expect(lateFeePerDayCents({ rates: { day: 24 } })).toBe(3600);
    expect(lateFeePerDayCents({ rates: { week: 14 } })).toBe(300);
  });
});

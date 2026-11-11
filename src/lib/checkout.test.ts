import { describe, expect, it } from "vitest";
import { getItem } from "./catalog";
import { quoteLine, type BagLine } from "./bag";
import {
  DEMO_CARD_ERROR,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  formatPhone,
  isTestCard,
  luhn,
  validEduEmail,
  validExpiry,
  validateCard,
} from "./card";
import { WINDOWS, buildOrder, groupHandoffs, handoffKey, makeOrderId } from "./order";

const NOW = new Date(2026, 10, 11);

describe("card checks", () => {
  it("passes Luhn for the Stripe test cards and fails a typo", () => {
    expect(luhn("4242 4242 4242 4242")).toBe(true);
    expect(luhn("5555555555554444")).toBe(true);
    expect(luhn("4242 4242 4242 4241")).toBe(false);
    expect(luhn("1234")).toBe(false);
  });

  it("accepts only the published test numbers", () => {
    expect(isTestCard("4242 4242 4242 4242")).toBe(true);
    expect(isTestCard("5555 5555 5555 4444")).toBe(true);
    // a real-format, Luhn-valid Visa that is not a test card
    expect(luhn("4111111111111111")).toBe(true);
    expect(isTestCard("4111111111111111")).toBe(false);
    expect(validateCard({ number: "4111 1111 1111 1111", expiry: "12/28", cvc: "123", zip: "10012" }, NOW).number).toBe(DEMO_CARD_ERROR);
  });

  it("validates a full test card", () => {
    expect(validateCard({ number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123", zip: "10012" }, NOW)).toEqual({});
  });

  it("requires a future expiry", () => {
    expect(validExpiry("11/26", NOW)).toBe(true);
    expect(validExpiry("10/26", NOW)).toBe(false);
    expect(validExpiry("13/30", NOW)).toBe(false);
    expect(validExpiry("1/30", NOW)).toBe(false);
  });

  it("detects brands and formats input", () => {
    expect(detectBrand("4242")).toBe("Visa");
    expect(detectBrand("5555")).toBe("Mastercard");
    expect(detectBrand("3782")).toBe("Amex");
    expect(detectBrand("9")).toBeNull();
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("4")).toBe("04/");
    expect(formatPhone("2125550134")).toBe("(212) 555-0134");
  });

  it("only accepts the campus email domain", () => {
    expect(validEduEmail("maya.k@nyu.edu", "nyu.edu")).toBe(true);
    expect(validEduEmail("MAYA.K@NYU.EDU ", "nyu.edu")).toBe(true);
    expect(validEduEmail("maya@gmail.com", "nyu.edu")).toBe(false);
    expect(validEduEmail("maya@fakenyu.edu", "nyu.edu")).toBe(false);
  });
});

describe("orders and totals", () => {
  const mk = (id: string, slug: string, start: string, end: string, spot: BagLine["pickupSpotId"]): BagLine => {
    const item = getItem(slug)!;
    return {
      id,
      slug,
      start,
      end,
      pickupSpotId: spot,
      quote: quoteLine(item, { start: new Date(`${start}T00:00:00`), end: new Date(`${end}T00:00:00`) }, NOW),
    };
  };
  const lines = [
    mk("a", "burton-ripcord-154", "2026-11-13", "2026-11-15", "bobst"),
    mk("b", "rowenta-xcel-steamer", "2026-11-13", "2026-11-15", "bobst"),
    mk("c", "canon-eos-r50-kit", "2026-11-16", "2026-11-24", "tandon"),
  ];

  it("has 13 one-hour windows from 9–10am to 9–10pm", () => {
    expect(WINDOWS).toHaveLength(13);
    expect(WINDOWS[0].label).toBe("9–10am");
    expect(WINDOWS[3].label).toBe("12–1pm");
    expect(WINDOWS[2].label).toBe("11am–12pm");
    expect(WINDOWS[12].label).toBe("9–10pm");
  });

  it("groups lines that share a spot and dates into one handoff", () => {
    const g = groupHandoffs(lines);
    expect(g).toHaveLength(2);
    expect(g[0].lines.map((l) => l.id)).toEqual(["a", "b"]);
  });

  it("builds an order with totals that keep the deposit separate", () => {
    const choices = Object.fromEntries(lines.map((l) => [handoffKey(l), { pickupWindow: "14", returnWindow: "20" }]));
    const o = buildOrder({ lines, choices, email: "Maya.K@nyu.edu", name: "Maya K", phone: "(212) 555-0134", now: NOW, rand: () => 0.5 });
    expect(o.id).toMatch(/^DB-[A-Z2-9]{6}$/);
    expect(o.handoffCode).toMatch(/^\d{4}$/);
    expect(o.email).toBe("maya.k@nyu.edu");
    // 55 + (steamer 3 days: 3×5=15 vs weekend 10 -> 10) + 220 = 285
    expect(o.totals.subtotalCents).toBe(5500 + 1000 + 22000);
    expect(o.totals.taxCents).toBe(Math.round(28500 * 0.08875));
    expect(o.totals.dueTodayCents).toBe(28500 + o.totals.taxCents);
    expect(o.depositHold).toBe(15000 + 0 + 25000);
    expect(o.lines[0].pickupWindow).toBe("14");
  });

  it("makes unique-looking order ids", () => {
    const ids = new Set(Array.from({ length: 50 }, () => makeOrderId()));
    expect(ids.size).toBeGreaterThan(45);
  });
});

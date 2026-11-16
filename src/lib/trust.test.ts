import { describe, expect, it } from "vitest";
import { SEED_REPORTS } from "@/data/reports";
import { nextCheck, stageState, validateSideCheck, type SideCheck } from "./handoff";
import { orderStatus, type Order } from "./order";
import { isUnderReview, openReportCount, reviewableOrders, shortName, validateReview, type Report } from "./trust";

const ok: SideCheck = { photo: "data:image/jpeg;base64,x", verdict: "match", at: "2026-11-20T15:00:00Z" };
const bad: SideCheck = { ...ok, verdict: "mismatch", note: "Crack on the lens" };

describe("handoff condition check", () => {
  it("settles a stage when both sides confirm, or as soon as either says it doesn't match", () => {
    expect(stageState(undefined)).toBe("open");
    expect(stageState({ renter: ok })).toBe("partial");
    expect(stageState({ renter: ok, lender: ok })).toBe("matched");
    expect(stageState({ lender: bad })).toBe("mismatch");
  });

  it("walks pickup (renter, lender) then return, and stops after a mismatch", () => {
    expect(nextCheck(undefined)).toEqual({ stage: "pickup", side: "renter" });
    expect(nextCheck({ pickup: { renter: ok } })).toEqual({ stage: "pickup", side: "lender" });
    expect(nextCheck({ pickup: { renter: ok, lender: ok } })).toEqual({ stage: "return", side: "renter" });
    expect(nextCheck({ pickup: { renter: bad } })).toBeNull();
    expect(nextCheck({ pickup: { renter: ok, lender: ok }, return: { renter: ok, lender: ok } })).toBeNull();
  });

  it("needs a photo, a verdict, and a note when it doesn't match", () => {
    expect(validateSideCheck({ photo: null, verdict: "match", note: "" })).toMatch(/photo/);
    expect(validateSideCheck({ photo: "x", verdict: null, note: "" })).toMatch(/Matches/);
    expect(validateSideCheck({ photo: "x", verdict: "mismatch", note: " " })).toMatch(/note/);
    expect(validateSideCheck({ photo: "x", verdict: "match", note: "" })).toBeNull();
  });

  it("moves the order status: cancelled after a failed pickup, returned after the return check", () => {
    const lines = [{ start: "2026-12-01", returnBy: "2026-12-03" }] as Order["lines"];
    expect(orderStatus({ lines, cancelledAt: "2026-12-01T10:00:00Z" }, "2026-11-20")).toBe("cancelled");
    expect(orderStatus({ lines, checks: { pickup: { renter: ok, lender: ok } } }, "2026-11-20")).toBe("picked-up");
    expect(orderStatus({ lines, checks: { pickup: { renter: ok, lender: ok }, return: { renter: ok, lender: ok } } }, "2026-11-20")).toBe("returned");
  });
});

describe("reports", () => {
  const r = (slug: string, status: Report["status"] = "open") => ({ slug, status });

  it("puts a listing under review at 2 open reports", () => {
    expect(isUnderReview("a", [r("a")])).toBe(false);
    expect(isUnderReview("a", [r("a"), r("a")])).toBe(true);
    expect(isUnderReview("a", [r("a"), r("a", "closed"), r("b")])).toBe(false);
    expect(openReportCount("a", [r("a"), r("a"), r("a")])).toBe(3);
  });

  it("seeds at most one open report per listing, so nothing starts under review", () => {
    for (const s of SEED_REPORTS) expect(isUnderReview(s.slug, SEED_REPORTS)).toBe(false);
  });
});

describe("reviews", () => {
  const order = (id: string, slug: string, extra: Partial<Order> = {}) =>
    ({ id, lines: [{ slug, start: "2026-12-01", returnBy: "2026-12-03" }], ...extra }) as Order;
  const returned = { checks: { pickup: { renter: ok, lender: ok }, return: { renter: ok, lender: ok } } };

  it("only lets renters with a completed rental review", () => {
    const today = "2026-11-20";
    expect(reviewableOrders("ti-84", [order("A", "ti-84")], [], today)).toEqual([]);
    expect(reviewableOrders("ti-84", [order("A", "ti-84", { cancelledAt: "x" })], [], today)).toEqual([]);
    expect(reviewableOrders("ti-84", [order("A", "ti-84", returned)], [], today).map((o) => o.id)).toEqual(["A"]);
    expect(reviewableOrders("ti-84", [order("A", "ti-84")], [], "2026-12-04").map((o) => o.id)).toEqual(["A"]);
    expect(reviewableOrders("dyson-v8", [order("A", "ti-84", returned)], [], today)).toEqual([]);
  });

  it("allows one review per item per rental", () => {
    expect(reviewableOrders("ti-84", [order("A", "ti-84", returned)], [{ slug: "ti-84", orderId: "A" }], "2026-11-20")).toEqual([]);
  });

  it("needs a 1–5 rating and some text", () => {
    expect(validateReview(null, "Great calculator, fresh batteries.")).toMatch(/rating/);
    expect(validateReview(6, "Great calculator, fresh batteries.")).toMatch(/rating/);
    expect(validateReview(5, "ok")).toMatch(/sentence/);
    expect(validateReview(4, "Great calculator, fresh batteries.")).toBeNull();
  });

  it("shortens names for review bylines", () => {
    expect(shortName("Maya Kapoor")).toBe("Maya K.");
    expect(shortName("Maya")).toBe("Maya");
  });
});

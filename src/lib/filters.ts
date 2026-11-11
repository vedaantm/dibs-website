import { CATEGORIES } from "@/data/categories";
import { PICKUP_SPOTS } from "@/data/campus";
import type { CategorySlug, Condition, Item, PickupSpotId } from "@/data/types";
import { perDayPrice } from "./catalog";
import { comingWeekend, isBlockedBetween } from "./dates";
import type { RateUnit } from "./format";

export type SortKey = "newest" | "price-asc" | "price-desc" | "deposit-asc";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price low–high" },
  { key: "price-desc", label: "Price high–low" },
  { key: "deposit-asc", label: "Deposit low–high" },
];

export const RATE_TYPES: { key: RateUnit; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "weekend", label: "Weekend" },
  { key: "week", label: "Week" },
  { key: "semester", label: "Semester" },
];

export const CONDITIONS: Condition[] = ["Like new", "Excellent", "Good"];

/** Bounds of the price-per-day range filter, in dollars. */
export const PRICE_MIN = 0;
export const PRICE_MAX = 50;

export type Filters = {
  cats: CategorySlug[];
  subs: string[];
  rates: RateUnit[];
  min?: number;
  max?: number;
  spots: PickupSpotId[];
  conds: Condition[];
  weekend: boolean;
  sort: SortKey;
};

type ParamsLike = { get(name: string): string | null };

function list(p: ParamsLike, key: string): string[] {
  const v = p.get(key);
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function num(p: ParamsLike, key: string): number | undefined {
  const v = p.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFilters(p: ParamsLike): Filters {
  const catSlugs = CATEGORIES.map((c) => c.slug) as string[];
  const spotIds = PICKUP_SPOTS.map((s) => s.id) as string[];
  const rateKeys = RATE_TYPES.map((r) => r.key) as string[];
  const sortKeys = SORTS.map((s) => s.key) as string[];
  const sort = p.get("sort") ?? "newest";
  let min = num(p, "min");
  let max = num(p, "max");
  if (min !== undefined && min <= PRICE_MIN) min = undefined;
  if (max !== undefined && max >= PRICE_MAX) max = undefined;
  return {
    cats: list(p, "cat").filter((c) => catSlugs.includes(c)) as CategorySlug[],
    subs: list(p, "sub"),
    rates: list(p, "rate").filter((r) => rateKeys.includes(r)) as RateUnit[],
    min,
    max,
    spots: list(p, "spot").filter((s) => spotIds.includes(s)) as PickupSpotId[],
    conds: list(p, "cond").filter((c) => (CONDITIONS as string[]).includes(c)) as Condition[],
    weekend: p.get("weekend") === "1",
    sort: (sortKeys.includes(sort) ? sort : "newest") as SortKey,
  };
}

/** Serialises filters back into a query string, keeping unrelated params (q, edit). */
export function filtersToParams(f: Filters, base?: URLSearchParams): URLSearchParams {
  const p = new URLSearchParams(base);
  const set = (k: string, v: string | undefined) => (v ? p.set(k, v) : p.delete(k));
  set("cat", f.cats.join(","));
  set("sub", f.subs.join(","));
  set("rate", f.rates.join(","));
  set("min", f.min !== undefined && f.min > PRICE_MIN ? String(f.min) : undefined);
  set("max", f.max !== undefined && f.max < PRICE_MAX ? String(f.max) : undefined);
  set("spot", f.spots.join(","));
  set("cond", f.conds.join(","));
  set("weekend", f.weekend ? "1" : undefined);
  set("sort", f.sort !== "newest" ? f.sort : undefined);
  return p;
}

export function emptyFilters(sort: SortKey = "newest"): Filters {
  return { cats: [], subs: [], rates: [], spots: [], conds: [], weekend: false, sort };
}

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.cats.length + f.subs.length + f.rates.length + f.spots.length + f.conds.length > 0 ||
    f.min !== undefined ||
    f.max !== undefined ||
    f.weekend
  );
}

/** Applies every filter. `now` is needed for "Available this weekend". */
export function applyFilters(items: Item[], f: Filters, now: Date): Item[] {
  const wk = f.weekend ? comingWeekend(now) : null;
  return items.filter((i) => {
    if (f.cats.length && !f.cats.includes(i.categorySlug)) return false;
    if (f.subs.length && !f.subs.includes(i.subcategory)) return false;
    if (f.rates.length && !f.rates.some((r) => i.rates[r] !== undefined)) return false;
    const pd = perDayPrice(i);
    if (f.min !== undefined && pd < f.min) return false;
    if (f.max !== undefined && pd > f.max) return false;
    if (f.spots.length && !f.spots.some((s) => i.pickupSpotIds.includes(s))) return false;
    if (f.conds.length && !f.conds.includes(i.condition)) return false;
    if (wk && isBlockedBetween(i.blockedDates, wk.start, wk.end)) return false;
    return true;
  });
}

export function sortItems(items: Item[], sort: SortKey): Item[] {
  const out = [...items];
  const bySlug = (a: Item, b: Item) => a.slug.localeCompare(b.slug);
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => perDayPrice(a) - perDayPrice(b) || bySlug(a, b));
    case "price-desc":
      return out.sort((a, b) => perDayPrice(b) - perDayPrice(a) || bySlug(a, b));
    case "deposit-asc":
      return out.sort((a, b) => a.deposit - b.deposit || perDayPrice(a) - perDayPrice(b) || bySlug(a, b));
    default:
      return out.sort((a, b) => b.listedAt.localeCompare(a.listedAt) || bySlug(a, b));
  }
}

export type ActiveTag = { key: string; label: string; remove: (f: Filters) => Filters };

/** Removable toolbar tags for each active filter: "UNDER $20 / DAY ×" etc. */
export function activeTags(f: Filters): ActiveTag[] {
  const tags: ActiveTag[] = [];
  for (const c of f.cats) {
    const name = CATEGORIES.find((x) => x.slug === c)?.name ?? c;
    tags.push({ key: `cat-${c}`, label: name, remove: (x) => ({ ...x, cats: x.cats.filter((v) => v !== c) }) });
  }
  for (const s of f.subs) tags.push({ key: `sub-${s}`, label: s, remove: (x) => ({ ...x, subs: x.subs.filter((v) => v !== s) }) });
  for (const r of f.rates) {
    const label = RATE_TYPES.find((x) => x.key === r)?.label ?? r;
    tags.push({ key: `rate-${r}`, label: `${label} rate`, remove: (x) => ({ ...x, rates: x.rates.filter((v) => v !== r) }) });
  }
  if (f.min !== undefined || f.max !== undefined) {
    const label =
      f.min !== undefined && f.max !== undefined
        ? `$${f.min}–$${f.max} / day`
        : f.max !== undefined
          ? `Under $${f.max} / day`
          : `Over $${f.min} / day`;
    tags.push({ key: "price", label, remove: (x) => ({ ...x, min: undefined, max: undefined }) });
  }
  for (const s of f.spots) {
    const name = PICKUP_SPOTS.find((x) => x.id === s)?.name ?? s;
    tags.push({ key: `spot-${s}`, label: name, remove: (x) => ({ ...x, spots: x.spots.filter((v) => v !== s) }) });
  }
  for (const c of f.conds) tags.push({ key: `cond-${c}`, label: c, remove: (x) => ({ ...x, conds: x.conds.filter((v) => v !== c) }) });
  if (f.weekend) tags.push({ key: "weekend", label: "Available this weekend", remove: (x) => ({ ...x, weekend: false }) });
  return tags;
}

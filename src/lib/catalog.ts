import { CATEGORIES } from "@/data/categories";
import { PICKUP_SPOTS } from "@/data/campus";
import { EDITS } from "@/data/edits";
import { ITEMS } from "@/data/items";
import { LENDERS } from "@/data/lenders";
import type { Category, Edit, Item, Lender, PickupSpot } from "@/data/types";
import type { RateUnit } from "./format";

export function getItems(): Item[] {
  return ITEMS;
}

export function getItem(slug: string): Item | undefined {
  return ITEMS.find((i) => i.slug === slug);
}

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getByCategory(slug: string): Item[] {
  return ITEMS.filter((i) => i.categorySlug === slug);
}

export function getLender(id: string): Lender | undefined {
  return LENDERS.find((l) => l.id === id);
}

export function getPickupSpot(id: string): PickupSpot | undefined {
  return PICKUP_SPOTS.find((s) => s.id === id);
}

export function getPickupSpots(): PickupSpot[] {
  return PICKUP_SPOTS;
}

export function getEdits(): Edit[] {
  return EDITS;
}

export function getEdit(slug: string): Edit | undefined {
  return EDITS.find((e) => e.slug === slug);
}

export function getEditItems(slug: string): Item[] {
  const edit = getEdit(slug);
  if (!edit) return [];
  return edit.itemSlugs.map(getItem).filter((i): i is Item => Boolean(i));
}

export function getLenderItems(lenderId: string, exclude?: string): Item[] {
  return ITEMS.filter((i) => i.lenderId === lenderId && i.slug !== exclude);
}

/** Same subcategory first, then same category, then items sharing an edit, then newest. */
export function getRelated(item: Item, n = 4): Item[] {
  const out: Item[] = [];
  const add = (list: Item[]) => {
    for (const i of list) {
      if (out.length >= n) return;
      if (i.slug !== item.slug && !out.some((o) => o.slug === i.slug)) out.push(i);
    }
  };
  add(ITEMS.filter((i) => i.categorySlug === item.categorySlug && i.subcategory === item.subcategory));
  add(ITEMS.filter((i) => i.categorySlug === item.categorySlug));
  for (const e of EDITS) if (e.itemSlugs.includes(item.slug)) add(getEditItems(e.slug));
  add(getNewest(ITEMS.length));
  return out;
}

export function getNewest(n: number): Item[] {
  return [...ITEMS].sort((a, b) => b.listedAt.localeCompare(a.listedAt) || a.slug.localeCompare(b.slug)).slice(0, n);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function haystack(item: Item): string[] {
  const cat = getCategory(item.categorySlug);
  return [item.name, item.brand, item.categorySlug, cat?.name ?? "", item.subcategory, ...item.tags].map((s) =>
    s.toLowerCase(),
  );
}

/**
 * Case-insensitive search over name, brand, category, subcategory and tags.
 * Every word in the query must match somewhere; punctuation is ignored, so "ti84" finds "TI-84".
 */
export function searchItems(query: string): Item[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean);
  if (words.length === 0) return [];
  return ITEMS.filter((item) => {
    const fields = haystack(item);
    const joined = fields.map(normalize).join(" ");
    const spaced = fields.join(" ").split(/[^a-z0-9]+/).filter(Boolean);
    return words.every((w) => joined.includes(w) || spaced.some((t) => t.startsWith(w)));
  });
}

const RATE_ORDER: RateUnit[] = ["day", "week", "weekend", "semester"];

/**
 * The headline rate for cards: the shortest period the item rents for.
 * Day rate when offered; textbooks (no day rate) show their week rate.
 */
export function lowestRate(item: Item): { amount: number; unit: RateUnit } {
  for (const unit of RATE_ORDER) {
    const amount = item.rates[unit];
    if (amount !== undefined) return { amount, unit };
  }
  throw new Error(`Item ${item.slug} has no rates`);
}

/** Day-equivalent price used for "price per day" filtering and sorting. */
export function perDayPrice(item: Item): number {
  const r = item.rates;
  if (r.day !== undefined) return r.day;
  if (r.week !== undefined) return r.week / 7;
  if (r.weekend !== undefined) return r.weekend / 3;
  if (r.semester !== undefined) return r.semester / 105;
  return 0;
}

/** True when listed within 7 days of the catalog snapshot date. */
export function isJustListed(item: Item, reference: string): boolean {
  const ms = Date.parse(reference) - Date.parse(item.listedAt);
  return ms >= 0 && ms < 7 * 24 * 60 * 60 * 1000;
}

import type { CategorySlug, Item } from "@/data/types";
import { getByCategory, getCategory, getEdit, getEditItems, getItems, searchItems } from "@/lib/catalog";

export type Scope = { kind: "all" } | { kind: "category"; slug: CategorySlug } | { kind: "search" };

type ParamsLike = { get(name: string): string | null };

export type ScopeInfo = {
  title: string;
  blurb?: string;
  base: Item[];
  /** Row at the top: subcategories in a category, categories elsewhere. */
  row: "subcategories" | "categories";
  query?: string;
  editSlug?: string;
};

/** Resolves the base item set and heading for a collection page from scope + URL params. */
export function resolveScope(scope: Scope, params: ParamsLike): ScopeInfo {
  if (scope.kind === "category") {
    const cat = getCategory(scope.slug)!;
    return { title: cat.name, blurb: cat.blurb, base: getByCategory(scope.slug), row: "subcategories" };
  }
  if (scope.kind === "search") {
    const q = (params.get("q") ?? "").trim();
    if (!q) return { title: "Search", blurb: "Type what you need in the search bar, or browse below.", base: getItems(), row: "categories" };
    return { title: `Results for ‘${q}’`, base: searchItems(q), row: "categories", query: q };
  }
  const editSlug = params.get("edit") ?? undefined;
  const edit = editSlug ? getEdit(editSlug) : undefined;
  if (edit) {
    return { title: edit.title, blurb: edit.blurb, base: getEditItems(edit.slug), row: "categories", editSlug: edit.slug };
  }
  return {
    title: "Shop all",
    blurb: "Textbooks, gear, cameras and formalwear from verified NYU students.",
    base: getItems(),
    row: "categories",
  };
}

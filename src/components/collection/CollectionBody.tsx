"use client";

import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/data/categories";
import { getCategory, getNewest } from "@/lib/catalog";
import { today } from "@/lib/dates";
import {
  SORTS,
  activeTags,
  applyFilters,
  emptyFilters,
  filtersToParams,
  hasActiveFilters,
  parseFilters,
  sortItems,
  type Filters,
  type SortKey,
} from "@/lib/filters";
import { FilterDrawer } from "./FilterDrawer";
import { resolveScope, type Scope } from "./scope";
import { SubRow, type RowEntry } from "./SubRow";

type Props = {
  scope: Scope;
  /** URL query string; empty in the prerendered fallback. */
  query: string;
  /** False for the static fallback shell (no URL access yet). */
  interactive?: boolean;
};

/** Shared collection layout: row, title + count, sticky toolbar, filter drawer, grid, empty state. */
export function CollectionBody({ scope, query, interactive = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  const params = useMemo(() => new URLSearchParams(query), [query]);
  const info = resolveScope(scope, params);
  const urlFilters = useMemo(() => parseFilters(params), [params]);
  // Optimistic so checkboxes and counts respond instantly while the URL updates.
  const [filters, setOptimisticFilters] = useOptimistic(urlFilters);
  const [, startTransition] = useTransition();
  const lockedCategory = scope.kind === "category" ? scope.slug : undefined;

  const results = useMemo(() => {
    const now = filters.weekend ? today() : new Date(0);
    return sortItems(applyFilters(info.base, filters, now), filters.sort);
  }, [info.base, filters]);

  const go = (f: Filters, opts?: { replace?: boolean }) => {
    const qs = filtersToParams(f, params).toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      setOptimisticFilters(f);
      if (opts?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    });
  };

  const rowEntries: RowEntry[] =
    info.row === "subcategories" && lockedCategory
      ? getCategory(lockedCategory)!.subcategories.map((s) => {
          const items = info.base.filter((i) => i.subcategory === s);
          return { key: s, label: s, count: items.length, gradient: getCategory(lockedCategory)!.gradient, items };
        })
      : CATEGORIES.map((c) => {
          const items = info.base.filter((i) => i.categorySlug === c.slug);
          return { key: c.slug, label: c.shortName, count: items.length, gradient: c.gradient, items };
        }).filter((e) => e.count > 0);

  const rowActive = info.row === "subcategories" ? filters.subs : filters.cats;
  const pickRow = (key: string) => {
    if (info.row === "subcategories") go({ ...filters, subs: filters.subs.length === 1 && filters.subs[0] === key ? [] : [key] });
    else go({ ...filters, cats: filters.cats.length === 1 && filters.cats[0] === key ? [] : [key as Filters["cats"][number]] });
  };

  const tags = activeTags(filters);
  const activeCount = tags.length;

  return (
    <>
      <Container>
        {rowEntries.length > 1 && (
          <div className="mt-6">
            <SubRow
              entries={rowEntries}
              active={rowActive}
              onPick={interactive ? pickRow : undefined}
              label={info.row === "subcategories" ? "Subcategories" : "Categories"}
            />
          </div>
        )}
        <div className="mb-6 mt-8 flex flex-col gap-3 md:mb-8 md:mt-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-[28px] font-medium uppercase leading-[1.05] tracking-[-0.01em] md:text-[40px]">{info.title}</h1>
            {info.blurb && <p className="mt-2 text-stone-deep">{info.blurb}</p>}
          </div>
          <p className="label shrink-0 tabular-nums" aria-live="polite">
            {results.length} item{results.length === 1 ? "" : "s"}
          </p>
        </div>
      </Container>

      <div className="sticky top-[var(--header-h)] z-20 border-y border-line bg-paper">
        <Container className="flex h-12 items-center gap-4">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            disabled={!interactive}
            aria-haspopup="dialog"
            className="label inline-flex h-full shrink-0 items-center gap-1.5 hover:opacity-70"
          >
            Filter{activeCount > 0 && <span className="tabular-nums">({activeCount})</span>}
          </button>
          <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto" aria-label="Active filters">
            {tags.map((t) => (
              <li key={t.key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(t.remove(filters))}
                  aria-label={`Remove filter: ${t.label}`}
                  className="inline-flex h-7 items-center gap-1.5 border border-ink px-2 text-[11px] font-medium uppercase tracking-[0.04em] hover:bg-ink hover:text-paper"
                >
                  {t.label}
                  <X size={12} strokeWidth={1.5} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="relative flex shrink-0 items-center">
            <label htmlFor="sort" className="label pointer-events-none flex items-center gap-1">
              <span className="hidden sm:inline">Sort:</span>
              <span>{SORTS.find((s) => s.key === filters.sort)?.label}</span>
              <ChevronDown size={14} strokeWidth={1.25} aria-hidden />
            </label>
            <select
              id="sort"
              value={filters.sort}
              disabled={!interactive}
              onChange={(e) => go({ ...filters, sort: e.target.value as SortKey })}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </Container>
      </div>

      <Container className="pb-20 pt-8 md:pb-28 md:pt-10">
        {results.length > 0 ? (
          <ProductGrid items={results} priorityCount={4} />
        ) : (
          <div>
            <div className="py-10">
              <p className="text-[22px] font-medium uppercase md:text-[28px]">Nothing matches yet.</p>
              <p className="mt-2 max-w-md text-stone-deep">
                {info.query
                  ? "Try a shorter search, or ask the campus: someone probably has one."
                  : "Loosen a filter or two. New listings go up every Thursday."}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                {hasActiveFilters(filters) && (
                  <Button variant="outline" onClick={() => go(emptyFilters(filters.sort))}>
                    Clear filters
                  </Button>
                )}
                {info.query && (
                  <Link href={`/request?q=${encodeURIComponent(info.query)}`} className="label inline-flex h-12 items-center underline underline-offset-4">
                    Request it
                  </Link>
                )}
              </div>
            </div>
            <h2 className="label mb-6 mt-6 border-t border-line pt-8">You might want these instead</h2>
            <ProductGrid items={getNewest(4)} />
          </div>
        )}
      </Container>

      {interactive && (
        <FilterDrawer
          open={drawer}
          onClose={() => setDrawer(false)}
          filters={filters}
          onChange={go}
          count={results.length}
          lockedCategory={lockedCategory}
        />
      )}
    </>
  );
}

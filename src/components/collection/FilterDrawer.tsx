"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { DualRange } from "@/components/ui/DualRange";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { CATEGORIES } from "@/data/categories";
import { PICKUP_SPOTS } from "@/data/campus";
import type { CategorySlug } from "@/data/types";
import { CONDITIONS, PRICE_MAX, PRICE_MIN, RATE_TYPES, emptyFilters, type Filters } from "@/lib/filters";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5">
      <legend className="label float-left mb-3 w-full">{title}</legend>
      <div className="clear-both flex flex-col gap-2.5">{children}</div>
    </fieldset>
  );
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters, opts?: { replace?: boolean }) => void;
  count: number;
  /** Category page: hide the Category group, limit subcategories to this one. */
  lockedCategory?: CategorySlug;
};

export function FilterDrawer({ open, onClose, filters: f, onChange, count, lockedCategory }: Props) {
  const subCats = lockedCategory
    ? CATEGORIES.filter((c) => c.slug === lockedCategory)
    : f.cats.length
      ? CATEGORIES.filter((c) => f.cats.includes(c.slug))
      : CATEGORIES;
  const subs = subCats.flatMap((c) => c.subcategories.map((s) => ({ s, cat: c.shortName })));

  return (
    <Sheet open={open} onClose={onClose} side="left" label="Filter" className="w-full md:w-[420px]">
      <SheetHeader title="Filter" onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-4 md:px-6">
        {!lockedCategory && (
          <Group title="Category">
            {CATEGORIES.map((c) => (
              <Checkbox
                key={c.slug}
                id={`f-cat-${c.slug}`}
                label={c.name}
                checked={f.cats.includes(c.slug)}
                onChange={() => onChange({ ...f, cats: toggle(f.cats, c.slug) })}
              />
            ))}
          </Group>
        )}
        <Group title="Subcategory">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {subs.map(({ s, cat }) => (
              <Checkbox
                key={`${cat}-${s}`}
                id={`f-sub-${cat}-${s}`}
                label={s}
                description={lockedCategory ? undefined : cat}
                checked={f.subs.includes(s)}
                onChange={() => onChange({ ...f, subs: toggle(f.subs, s) })}
              />
            ))}
          </div>
        </Group>
        <Group title="Rate type">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {RATE_TYPES.map((r) => (
              <Checkbox
                key={r.key}
                id={`f-rate-${r.key}`}
                label={r.label}
                checked={f.rates.includes(r.key)}
                onChange={() => onChange({ ...f, rates: toggle(f.rates, r.key) })}
              />
            ))}
          </div>
        </Group>
        <Group title="Price per day">
          <DualRange
            label="Price per day"
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={[f.min ?? PRICE_MIN, f.max ?? PRICE_MAX]}
            format={(n) => `$${n}`}
            onChange={([lo, hi]) =>
              onChange(
                { ...f, min: lo > PRICE_MIN ? lo : undefined, max: hi < PRICE_MAX ? hi : undefined },
                { replace: true },
              )
            }
          />
          <p className="text-[12px] text-stone-deep">Textbooks count as their week rate ÷ 7.</p>
        </Group>
        <Group title="Pickup spot">
          {PICKUP_SPOTS.map((s) => (
            <Checkbox
              key={s.id}
              id={`f-spot-${s.id}`}
              label={s.name}
              description={s.address}
              checked={f.spots.includes(s.id)}
              onChange={() => onChange({ ...f, spots: toggle(f.spots, s.id) })}
            />
          ))}
        </Group>
        <Group title="Condition">
          {CONDITIONS.map((c) => (
            <Checkbox
              key={c}
              id={`f-cond-${c}`}
              label={c}
              checked={f.conds.includes(c)}
              onChange={() => onChange({ ...f, conds: toggle(f.conds, c) })}
            />
          ))}
        </Group>
        <div className="py-5">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="flex flex-col">
              <span className="label">Available this weekend</span>
              <span className="text-[12px] text-stone-deep">Not booked on the coming Fri–Sun</span>
            </span>
            <span className="relative inline-flex shrink-0">
              <input
                type="checkbox"
                role="switch"
                checked={f.weekend}
                onChange={() => onChange({ ...f, weekend: !f.weekend })}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={clsx(
                  "flex h-6 w-11 items-center border border-ink p-0.5 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy",
                  f.weekend ? "bg-ink" : "bg-paper",
                )}
              >
                <span
                  className={clsx(
                    "size-[18px] transition-transform duration-200 ease-house",
                    f.weekend ? "translate-x-5 bg-paper" : "translate-x-0 bg-ink",
                  )}
                />
              </span>
            </span>
          </label>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-4 py-4 md:px-6">
        <Button variant="text" onClick={() => onChange(emptyFilters(f.sort))}>
          Clear all
        </Button>
        <Button onClick={onClose} className="min-w-[180px]">
          Show {count} item{count === 1 ? "" : "s"}
        </Button>
      </div>
    </Sheet>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Select } from "@/components/ui/Field";
import { CATEGORIES } from "@/data/categories";
import { ITEMS } from "@/data/items";
import type { CategorySlug } from "@/data/types";
import { estimateMonthly } from "@/lib/estimator";
import { formatCents } from "@/lib/format";

/** Example payout ledger shown beside the estimator (keeps the homepage to five gradient blocks). */
function Ledger() {
  const rows: [string, string][] = [
    ["Burton Ripcord, 154cm", "3 weekends"],
    ["Weekend rate", "$55"],
    ["Rental income", "$165"],
    ["Dibs fee (10%, $500+ retail)", "−$16.50"],
  ];
  return (
    <div className="flex aspect-[4/5] flex-col justify-between bg-bone p-6 md:p-10">
      <div>
        <Eyebrow>Example · Dev P., Tandon &apos;26</Eyebrow>
        <p className="mt-3 max-w-xs text-[22px] font-medium uppercase leading-tight md:text-[28px]">Last February, one snowboard.</p>
      </div>
      <dl className="border-t border-ink">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-line py-3">
            <dt className="text-stone-deep">{k}</dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-4">
          <dt className="label">Paid out</dt>
          <dd className="label tabular-nums">$148.50</dd>
        </div>
      </dl>
    </div>
  );
}

export function ListYourGear() {
  const id = useId();
  const [cat, setCat] = useState<CategorySlug>("sports");
  const [n, setN] = useState(2);
  const est = useMemo(() => estimateMonthly(ITEMS, cat, n), [cat, n]);
  const unit = est.period === "weekend" ? "weekends" : "weeks";

  return (
    <section aria-labelledby={`${id}-title`} className="py-16 md:py-24">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 md:grid-cols-2 md:items-center md:gap-16 md:px-6">
        <Ledger />
        <div className="max-w-lg">
          <Eyebrow>Lenders</Eyebrow>
          <h2 id={`${id}-title`} className="section-title mt-3">
            Your skis are in storage 50 weeks a year.
          </h2>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-cat`} className="eyebrow">
                What would you list?
              </label>
              <Select id={`${id}-cat`} value={cat} onChange={(e) => setCat(e.target.value as CategorySlug)}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor={`${id}-n`} className="eyebrow">
                  {est.period === "weekend" ? "Weekends rented per month" : "Weeks rented per month"}
                </label>
                <span className="tabular-nums" aria-hidden>
                  {n}
                </span>
              </div>
              <input
                id={`${id}-n`}
                type="range"
                min={0}
                max={4}
                step={1}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                aria-valuetext={`${n} ${unit}`}
                className="h-6 w-full cursor-pointer accent-ink"
              />
              <div aria-hidden className="flex justify-between text-[11px] tabular-nums text-stone-deep">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i}>{i}</span>
                ))}
              </div>
            </div>

            <div className="border-t border-ink pt-4" aria-live="polite">
              <div className="flex justify-between gap-4 text-stone-deep">
                <span>
                  {n} {unit} × {formatCents(est.medianRate * 100)} median rate
                </span>
                <span className="tabular-nums">{formatCents(est.grossCents)}</span>
              </div>
              <div className="mt-1 flex justify-between gap-4 text-stone-deep">
                <span>Dibs fee {Math.round(est.feeRate * 100)}%</span>
                <span className="tabular-nums">−{formatCents(est.feeCents)}</span>
              </div>
              <p className="mt-3 flex items-baseline justify-between gap-4">
                <span className="label">You earn</span>
                <span className="text-[28px] font-medium tabular-nums md:text-[32px]">≈ {formatCents(est.netCents)} / month</span>
              </p>
            </div>
            <p className="text-[12px] text-stone-deep">
              Estimate based on current listings. Your first rental is fee-free. Deposit protects every rental.
            </p>
            <ButtonLink href="/list-your-gear" className="self-start">
              List an item
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

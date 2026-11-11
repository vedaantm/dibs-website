"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ItemImage } from "@/components/product/ItemImage";
import { MiniCard } from "@/components/product/MiniCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Select } from "@/components/ui/Field";
import type { Item, PickupSpotId } from "@/data/types";
import { bagTotals, type BagLine } from "@/lib/bag";
import { getEdits, getItem, getLender, getNewest, getPickupSpot } from "@/lib/catalog";
import { orderTotals } from "@/lib/fees";
import { formatCents } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useBag } from "@/store/bag";
import { EditDates } from "./EditDates";
import { lineDatesText } from "./LineDates";
import { DepositBox, SummaryTotals, TrustLines } from "./SummaryTotals";

function BagRow({ line }: { line: BagLine }) {
  const item = getItem(line.slug)!;
  const lender = getLender(item.lenderId)!;
  const remove = useBag((s) => s.remove);
  const updatePickup = useBag((s) => s.updatePickup);
  const [editing, setEditing] = useState(Boolean(line.issue));

  return (
    <li className="border-b border-line py-5">
      <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:gap-6">
        <Link href={`/item/${item.slug}`} tabIndex={-1} aria-hidden="true">
          <ItemImage item={item} bare sizes="120px" />
        </Link>
        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <Link href={`/item/${item.slug}`} className="label block hover:underline hover:underline-offset-4">
              {item.name}
            </Link>
            <p className="text-stone-deep">
              {item.brand}
              {item.size ? ` · ${item.size}` : ""}
            </p>
            <p className="mt-1 text-stone-deep">
              from {lender.firstName} {lender.lastInitial}., {lender.school} &apos;{String(lender.gradYear).slice(2)}
            </p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3 tabular-nums">
              {lineDatesText(line)}
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                aria-expanded={editing}
                className="eyebrow text-ink underline underline-offset-4 hover:no-underline"
              >
                Edit
              </button>
            </p>
            {line.issue ? (
              <p role="alert" className="mt-1 text-vermilion-deep">
                {line.issue}
              </p>
            ) : (
              <p className="mt-1 text-stone-deep">{line.quote.lines.map((l) => l.label).join(" · ")}</p>
            )}
          </div>
          <div>
            <label htmlFor={`spot-${line.id}`} className="eyebrow mb-1.5 block">
              Pickup spot
            </label>
            <Select
              id={`spot-${line.id}`}
              value={line.pickupSpotId}
              onChange={(e) => updatePickup(line.id, e.target.value as PickupSpotId)}
            >
              {item.pickupSpotIds.map((id) => (
                <option key={id} value={id}>
                  {getPickupSpot(id)!.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-start justify-between gap-4 md:flex-col md:items-end">
            <p className="label tabular-nums">{line.issue ? "—" : formatCents(line.quote.subtotal)}</p>
            <button
              type="button"
              onClick={() => remove(line.id)}
              aria-label={`Remove ${item.name}`}
              className="-mr-2 inline-flex size-10 items-center justify-center hover:opacity-60"
            >
              <X size={18} strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>
      </div>
      {editing && (
        <div className="mt-4 md:ml-[144px] md:max-w-sm">
          <EditDates line={line} onDone={() => setEditing(false)} />
        </div>
      )}
    </li>
  );
}

function pairsWith(lines: BagLine[]): Item[] {
  const inBag = new Set(lines.map((l) => l.slug));
  const out: Item[] = [];
  for (const e of getEdits()) {
    if (!e.itemSlugs.some((s) => inBag.has(s))) continue;
    for (const s of e.itemSlugs) {
      const item = getItem(s);
      if (item && !inBag.has(s) && !out.includes(item)) out.push(item);
    }
  }
  for (const i of getNewest(12)) if (out.length < 4 && !inBag.has(i.slug) && !out.includes(i)) out.push(i);
  return out.slice(0, 4);
}

export function BagPage() {
  const hydrated = useHydrated();
  const lines = useBag((s) => s.lines);
  if (!hydrated) return <Container className="h-[60svh]" aria-hidden />;

  if (lines.length === 0) {
    return (
      <Container className="pb-24 pt-10 md:pt-14">
        <h1 className="section-title">Bag</h1>
        <p className="mt-4 text-[18px] font-medium uppercase">Your bag is empty.</p>
        <p className="mt-1 text-stone-deep">Just listed this week:</p>
        <ul className="mt-8 grid max-w-3xl grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {getNewest(4).map((i) => (
            <li key={i.slug}>
              <MiniCard item={i} />
            </li>
          ))}
        </ul>
      </Container>
    );
  }

  const t = bagTotals(lines);
  const totals = orderTotals(
    lines.filter((l) => !l.issue && l.quote.ok).map((l) => ({ subtotalCents: l.quote.subtotal, depositCents: l.quote.deposit })),
  );
  const groups = new Map<PickupSpotId, BagLine[]>();
  for (const l of lines) groups.set(l.pickupSpotId, [...(groups.get(l.pickupSpotId) ?? []), l]);

  return (
    <>
      <Container className="pb-16 pt-10 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] lg:gap-12">
          <div className="min-w-0">
            <h1 className="section-title">
              Bag <span className="tabular-nums text-stone-deep">({lines.length})</span>
            </h1>
            {[...groups.entries()].map(([spotId, group]) => {
              const spot = getPickupSpot(spotId)!;
              return (
                <section key={spotId} aria-label={`Pickup at ${spot.name}`} className="mt-8">
                  <h2 className="eyebrow border-b border-ink pb-2 text-ink">
                    Pickup at {spot.name} <span className="text-stone-deep">· {spot.address}</span>
                  </h2>
                  <ul>
                    {group.map((l) => (
                      <BagRow key={l.id} line={l} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <aside aria-label="Order summary" className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <div className="bg-bone p-6 md:p-8">
              <h2 className="label mb-5">Order summary</h2>
              <SummaryTotals totals={totals} />
              <DepositBox cents={totals.depositHoldCents} className="mt-6" />
              <p className="mt-4 text-stone-deep">
                Your payment is held by Dibs and released to the lender only after the handoff code is scanned.
              </p>
              {t.hasIssues && (
                <p role="alert" className="mt-4 text-vermilion-deep">
                  Some dates need fixing before checkout. Edit the highlighted lines.
                </p>
              )}
              <div className="mt-6">
                {t.hasIssues ? (
                  <Button full disabled>
                    Continue to checkout
                  </Button>
                ) : (
                  <ButtonLink href="/checkout" full>
                    Continue to checkout
                  </ButtonLink>
                )}
              </div>
              <TrustLines className="mt-4" />
            </div>
          </aside>
        </div>
      </Container>
      <Container as="section" aria-labelledby="pairs" className="border-t border-line pb-20 pt-12 md:pb-28">
        <h2 id="pairs" className="section-title mb-8">
          Pairs well with
        </h2>
        <ProductGrid items={pairsWith(lines)} />
      </Container>
    </>
  );
}

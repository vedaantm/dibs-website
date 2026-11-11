"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DepositBox, SummaryTotals } from "@/components/bag/SummaryTotals";
import { lineDatesText } from "@/components/bag/LineDates";
import { ItemImage } from "@/components/product/ItemImage";
import type { PickupSpotId } from "@/data/types";
import { getItem, getPickupSpot } from "@/lib/catalog";
import type { OrderTotals } from "@/lib/fees";
import { formatCents, formatCentsExact } from "@/lib/format";

export type SummaryLine = {
  key: string;
  slug: string;
  start: string;
  end?: string;
  plan?: "semester";
  pickupSpotId: PickupSpotId;
  subtotal: number;
  extra?: string;
};

function Lines({ lines }: { lines: SummaryLine[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {lines.map((l) => {
        const item = getItem(l.slug)!;
        return (
          <li key={l.key} className="grid grid-cols-[56px_1fr_auto] gap-3">
            <ItemImage item={item} bare sizes="56px" />
            <div className="min-w-0">
              <p className="label truncate">{item.name}</p>
              <p className="text-[12px] tabular-nums text-stone-deep">{lineDatesText(l)}</p>
              <p className="text-[12px] text-stone-deep">
                {getPickupSpot(l.pickupSpotId)?.name}
                {l.extra ? ` · ${l.extra}` : ""}
              </p>
            </div>
            <p className="tabular-nums">{formatCents(l.subtotal)}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Sticky bone summary with a dusk header band; collapses to a toggle bar on mobile. */
export function OrderSummary({ lines, totals, className }: { lines: SummaryLine[]; totals: OrderTotals; className?: string }) {
  const [open, setOpen] = useState(false);
  const body = (
    <div className="flex flex-col gap-6 p-5 md:p-8">
      <Lines lines={lines} />
      <SummaryTotals totals={totals} className="border-t border-line pt-4" />
      <DepositBox cents={totals.depositHoldCents} />
    </div>
  );
  return (
    <aside aria-label="Order summary" className={clsx("bg-bone", className)}>
      <div className="on-dark bg-dusk grain flex h-16 items-center px-5 text-paper md:px-8">
        <h2 className="label relative z-[2]">Your dibs ({lines.length})</h2>
      </div>
      {/* mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="summary-body"
        className="flex h-12 w-full items-center justify-between border-b border-line px-5 lg:hidden"
      >
        <span className="label inline-flex items-center gap-1.5">
          {open ? "Hide" : "Show"} order summary
          <ChevronDown size={14} strokeWidth={1.25} aria-hidden className={clsx("transition-transform duration-200", open && "rotate-180")} />
        </span>
        <span className="label tabular-nums">{formatCentsExact(totals.dueTodayCents)}</span>
      </button>
      <div id="summary-body" className={clsx(open ? "block" : "hidden", "lg:block")}>
        {body}
      </div>
    </aside>
  );
}

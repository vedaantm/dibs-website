"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { RentalDatePicker } from "@/components/rental/RentalDatePicker";
import { lowestRate } from "@/lib/catalog";
import { formatCents, formatRate } from "@/lib/format";
import { AddError, CallDibsButton, PickupChoice } from "./RentalPanel";
import { useItemRental } from "./ItemRentalContext";

/** Atticus-style sticky bottom bar on mobile: name + price | SELECT DATES / CALL DIBS — $X. */
export function MobileBar() {
  const { item, sel, quote, setSelection, callDibs, underReview } = useItemRental();
  const [open, setOpen] = useState(false);
  const rate = lowestRate(item);
  const ready = Boolean(quote?.ok);

  return (
    <>
      <div className="h-[72px] lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper lg:hidden">
        <div className="flex h-[72px] items-center gap-3 px-4">
          <div className="min-w-0 flex-1">
            <p className="label truncate">{item.name}</p>
            <p className="tabular-nums text-stone-deep">
              {ready ? `${formatCents(quote!.subtotal)} · ${quote!.days} day${quote!.days === 1 ? "" : "s"}` : formatRate(rate.amount, rate.unit)}
            </p>
          </div>
          <Button
            className="shrink-0"
            disabled={underReview}
            onClick={() => {
              if (ready) {
                if (!callDibs()) setOpen(true);
              } else setOpen(true);
            }}
          >
            {underReview ? "Under review" : ready ? `Call dibs — ${formatCents(quote!.subtotal)}` : "Select dates"}
          </Button>
        </div>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} side="bottom" label="Select dates">
        <SheetHeader title="Select dates" onClose={() => setOpen(false)} />
        <div className="flex flex-col gap-6 overflow-y-auto px-4 py-5">
          <RentalDatePicker item={item} value={sel} onChange={setSelection} compact idPrefix="sheet" />
          <PickupChoice idPrefix="sheet-pickup" />
        </div>
        <div className="shrink-0 border-t border-line px-4 py-3">
          <AddError />
          <CallDibsButton onDone={() => setOpen(false)} />
        </div>
      </Sheet>
    </>
  );
}

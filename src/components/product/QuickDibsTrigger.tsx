"use client";

import clsx from "clsx";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { RentalDatePicker } from "@/components/rental/RentalDatePicker";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { getItem, getPickupSpot } from "@/lib/catalog";
import { formatCents } from "@/lib/format";
import { useFocusTrap, useMediaQuery } from "@/lib/hooks";
import type { Quote, Selection } from "@/lib/pricing";
import { useBag } from "@/store/bag";
import { useUI } from "@/store/ui";

function QuickForm({ slug, onAdded, idPrefix }: { slug: string; onAdded: () => void; idPrefix: string }) {
  const item = getItem(slug)!;
  const add = useBag((s) => s.add);
  const openBag = useUI((s) => s.openBag);
  const pulseBag = useUI((s) => s.pulseBag);
  const [sel, setSel] = useState<Selection | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const spot = getPickupSpot(item.pickupSpotIds[0])!;

  return (
    <div className="flex flex-col gap-3">
      <RentalDatePicker
        item={item}
        value={sel}
        compact
        idPrefix={idPrefix}
        onChange={(s, q) => {
          setSel(s);
          setQuote(q);
          setError(null);
        }}
      />
      <p className="text-[12px] text-stone-deep">Pickup at {spot.name}. Change it in the bag.</p>
      {error && (
        <p role="alert" className="text-vermilion-deep">
          {error}
        </p>
      )}
      <Button
        full
        disabled={!quote?.ok}
        onClick={() => {
          if (!sel) return;
          const r = add(slug, sel, spot.id);
          if (!r.ok) return setError(r.error);
          onAdded();
          pulseBag();
          openBag();
        }}
      >
        {quote?.ok ? `Add — ${formatCents(quote.subtotal)}` : "Select dates"}
      </Button>
    </div>
  );
}

/**
 * QUICK DIBS: an ink bar that slides up on card hover (desktop) and opens a compact popover;
 * on mobile a small + button opens the same form as a bottom sheet.
 */
export function QuickDibsTrigger({ slug, name }: { slug: string; name: string }) {
  const desktop = useMediaQuery("(min-width: 768px)", true);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(popRef, open && desktop, close);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Quick dibs: ${name}`}
        className={clsx(
          "label absolute inset-x-0 bottom-0 z-[3] hidden h-10 items-center justify-center bg-ink text-paper transition-[transform,opacity] duration-250 ease-house md:flex",
          open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
        )}
      >
        Quick dibs
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Quick dibs: ${name}`}
        className="absolute bottom-2 right-2 z-[3] inline-flex size-8 items-center justify-center bg-ink text-paper md:hidden"
      >
        <Plus size={18} strokeWidth={1.25} aria-hidden />
      </button>

      {desktop && open && (
        <>
          <div aria-hidden className="fixed inset-0 z-[35]" onClick={close} />
          <div
            ref={popRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick dibs: ${name}`}
            className="absolute left-0 top-0 z-[36] w-full min-w-[300px] border border-ink bg-paper p-4 shadow-none"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="label min-w-0 truncate">{name}</p>
              <button type="button" onClick={close} aria-label="Close quick dibs" className="-mr-2 -mt-2 inline-flex size-8 shrink-0 items-center justify-center">
                <X size={16} strokeWidth={1.25} aria-hidden />
              </button>
            </div>
            <QuickForm slug={slug} onAdded={close} idPrefix={`qd-${slug}`} />
          </div>
        </>
      )}
      {!desktop && (
        <Sheet open={open} onClose={close} side="bottom" label={`Quick dibs: ${name}`}>
          <SheetHeader title="Quick dibs" onClose={close} />
          <div className="overflow-y-auto px-4 py-4">
            <p className="label mb-3 truncate">{name}</p>
            {open && <QuickForm slug={slug} onAdded={close} idPrefix={`qds-${slug}`} />}
          </div>
        </Sheet>
      )}
    </>
  );
}

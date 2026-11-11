"use client";

import Link from "next/link";
import { useState } from "react";
import { ItemImage } from "@/components/product/ItemImage";
import { MiniCard } from "@/components/product/MiniCard";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { bagTotals, type BagLine } from "@/lib/bag";
import { getItem, getNewest, getPickupSpot } from "@/lib/catalog";
import { formatCents } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { useBag } from "@/store/bag";
import { useUI } from "@/store/ui";
import { EditDates } from "./EditDates";
import { lineDatesText } from "./LineDates";

function DrawerLine({ line, onNavigate }: { line: BagLine; onNavigate: () => void }) {
  const item = getItem(line.slug)!;
  const spot = getPickupSpot(line.pickupSpotId);
  const remove = useBag((s) => s.remove);
  const [editing, setEditing] = useState(Boolean(line.issue));
  return (
    <li className="border-b border-line py-4">
      <div className="grid grid-cols-[80px_1fr_auto] gap-4">
        <Link href={`/item/${item.slug}`} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
          <ItemImage item={item} bare sizes="80px" />
        </Link>
        <div className="min-w-0">
          <Link href={`/item/${item.slug}`} onClick={onNavigate} className="label block truncate hover:underline hover:underline-offset-4">
            {item.name}
          </Link>
          <p className="text-stone-deep">{item.brand}</p>
          <p className="mt-2 tabular-nums">{lineDatesText(line)}</p>
          <p className="text-stone-deep">Pickup at {spot?.name}</p>
          {line.issue && (
            <p role="alert" className="mt-1 text-vermilion-deep">
              {line.issue}
            </p>
          )}
          <div className="mt-3 flex gap-4">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              aria-expanded={editing}
              className="eyebrow text-ink underline underline-offset-4 hover:no-underline"
            >
              Edit dates
            </button>
            <button type="button" onClick={() => remove(line.id)} className="eyebrow text-ink underline underline-offset-4 hover:no-underline">
              Remove
            </button>
          </div>
        </div>
        <p className="label tabular-nums">{line.issue ? "—" : formatCents(line.quote.subtotal)}</p>
      </div>
      {editing && (
        <div className="mt-4">
          <EditDates line={line} onDone={() => setEditing(false)} />
        </div>
      )}
    </li>
  );
}

/** Atticus-style basket drawer from the right. The one place a soft shadow is allowed. */
export function BagDrawer() {
  const open = useUI((s) => s.bagOpen);
  const setBag = useUI((s) => s.setBag);
  const hydrated = useHydrated();
  const lines = useBag((s) => s.lines);
  const close = () => setBag(false);
  const shown = hydrated ? lines : [];
  const t = bagTotals(shown);

  return (
    <Sheet open={open} onClose={close} side="right" label="Bag" shadow className="w-full md:w-[440px]">
      <SheetHeader title={`Bag (${shown.length})`} onClose={close} />
      {shown.length === 0 ? (
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-6">
          <p className="text-[18px] font-medium uppercase">Your bag is empty.</p>
          <p className="mt-1 text-stone-deep">Just listed this week:</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
            {getNewest(4).map((i) => (
              <li key={i.slug}>
                <MiniCard item={i} onNavigate={close} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto px-4 md:px-6">
            {shown.map((l) => (
              <DrawerLine key={l.id} line={l} onNavigate={close} />
            ))}
          </ul>
          <div className="shrink-0 border-t border-line bg-paper px-4 pb-5 pt-4 md:px-6">
            <dl className="flex flex-col gap-1">
              <div className="flex justify-between">
                <dt className="label">Subtotal</dt>
                <dd className="label tabular-nums">{formatCents(t.subtotal)}</dd>
              </div>
              {t.depositTotal > 0 && (
                <div className="flex justify-between text-stone-deep">
                  <dt>Deposit hold {formatCents(t.depositTotal)} — not charged</dt>
                </div>
              )}
              <p className="text-stone-deep">Tax at checkout</p>
            </dl>
            {t.hasIssues && (
              <p role="alert" className="mt-2 text-vermilion-deep">
                Fix the dates above before checkout.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {t.hasIssues ? (
                <Button full disabled>
                  Checkout
                </Button>
              ) : (
                <ButtonLink href="/checkout" full onClick={close}>
                  Checkout
                </ButtonLink>
              )}
              <ButtonLink href="/bag" variant="outline" full onClick={close}>
                View bag
              </ButtonLink>
              <Button variant="text" onClick={close} className="mt-1 self-center">
                Continue browsing
              </Button>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}

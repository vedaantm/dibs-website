import { format } from "date-fns";
import { BadgeCheck } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { CAMPUS } from "@/data/campus";
import type { Item, Lender } from "@/data/types";
import { getPickupSpot } from "@/lib/catalog";
import { fromISODate } from "@/lib/dates";
import { LATE_FEE_POLICY, lateFeePerDayCents } from "@/lib/fees";
import { formatCents, formatDollars } from "@/lib/format";

export function TrustRow({ item }: { item: Item }) {
  const lines = [
    "Payment held by Dibs until handoff",
    item.deposit > 0 ? "Deposit is a hold, released 48h after a clean return" : "No deposit — under $100",
    "Photo check-in at handoff",
    ".edu verified lender",
  ];
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] leading-snug text-stone-deep">
      {lines.map((l) => (
        <li key={l} className="flex gap-1.5">
          <span aria-hidden>·</span>
          {l}
        </li>
      ))}
    </ul>
  );
}

export function LenderCard({ lender }: { lender: Lender }) {
  return (
    <section aria-label="Lender" className="flex gap-4 border border-line p-4">
      <div aria-hidden className="flex size-12 shrink-0 items-center justify-center bg-bone text-[15px] font-medium">
        {lender.avatarInitials}
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5">
          <span className="label">
            {lender.firstName} {lender.lastInitial}. · {lender.school} &apos;{String(lender.gradYear).slice(2)}
          </span>
          <BadgeCheck size={16} strokeWidth={1.5} className="text-navy" aria-label="Verified NYU student" role="img" />
        </p>
        <p className="mt-1 tabular-nums">
          {lender.rating.toFixed(1)} · {lender.rentalsCompleted} rentals · replies in {lender.responseTime}
        </p>
        <p className="mt-0.5 text-stone-deep">Lending since {lender.joined}</p>
      </div>
    </section>
  );
}

export function Reviews({ item }: { item: Item }) {
  return (
    <section aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="label mb-2">
        Renter reviews{item.reviews.length > 0 && <span className="tabular-nums text-stone-deep"> ({item.reviews.length})</span>}
      </h2>
      {item.reviews.length === 0 ? (
        <p className="border-t border-line pt-3 text-stone-deep">No reviews yet. Your payment is still held until handoff.</p>
      ) : (
        <ul className="border-t border-line">
          {item.reviews.map((r) => (
            <li key={r.author + r.date} className="border-b border-line py-3">
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="label">{r.author}</span>
                <span className="tabular-nums text-stone-deep">
                  {r.rating} / 5 · {format(fromISODate(r.date), "MMM d, yyyy")}
                </span>
              </p>
              <p className="mt-1">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ItemAccordions({ item }: { item: Item }) {
  const spots = item.pickupSpotIds.map((id) => getPickupSpot(id)!);
  return (
    <Accordion>
      <AccordionItem title="Description" defaultOpen>
        <p>{item.description}</p>
      </AccordionItem>
      <AccordionItem title="What's included">
        <ul className="flex flex-col gap-1">
          {item.whatsIncluded.map((w) => (
            <li key={w}>— {w}</li>
          ))}
        </ul>
      </AccordionItem>
      <AccordionItem title="Specs">
        <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 gap-y-1.5">
          {item.specs.map((s) => (
            <div key={s.label} className="contents">
              <dt className="text-stone-deep">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </AccordionItem>
      <AccordionItem title="Deposit & damage">
        <div className="flex flex-col gap-3">
          {item.deposit > 0 ? (
            <p>
              The {formatDollars(item.deposit)} deposit is a hold on your card, not a charge. It&apos;s released within 48 hours of a
              clean return.
            </p>
          ) : (
            <p>No deposit on this one: it&apos;s under $100 retail. Damage is still covered by the photo check-in.</p>
          )}
          <p>
            <span className="label">Covered: </span>normal wear, the item not being as pictured (you get your money back), and a
            lender no-show.
          </p>
          <p>
            <span className="label">Late: </span>
            {LATE_FEE_POLICY} On this item that&apos;s {formatCents(lateFeePerDayCents(item))} a day.
          </p>
          <p>
            <span className="label">Damage: </span>both of you photograph the item at pickup and at return. Dibs compares the two
            sets, the lender and renter both confirm, and the deposit decides it. Disputes get a human review within 2 days.
          </p>
        </div>
      </AccordionItem>
      <AccordionItem title="Pickup & return">
        <div className="flex flex-col gap-3">
          <p>Handoffs {CAMPUS.handoffHours}. You pick a one-hour window at checkout.</p>
          <ul className="flex flex-col gap-2">
            {spots.map((s) => (
              <li key={s.id}>
                <span className="label">{s.name}</span>, {s.address}. <span className="text-stone-deep">{s.note}.</span>
              </li>
            ))}
          </ul>
          <p>Show your handoff code at pickup. The lender scans it, you both snap photos, and payment is released.</p>
        </div>
      </AccordionItem>
    </Accordion>
  );
}

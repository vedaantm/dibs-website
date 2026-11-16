import Link from "next/link";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { CAMPUS } from "@/data/campus";
import type { Item, Lender } from "@/data/types";
import { getPickupSpot } from "@/lib/catalog";
import { LATE_FEE_POLICY, lateFeePerDayCents } from "@/lib/fees";
import { formatCents, formatDollars } from "@/lib/format";
import { lenderLevel } from "@/lib/trust";
import { LEVEL_LABEL } from "@/lib/verification";

export function TrustRow({ item, lender }: { item: Item; lender: Lender }) {
  const lines = [
    "Payment held by Dibs until handoff",
    item.deposit > 0 ? "Deposit is a hold, released 48h after a clean return" : "No deposit — under $100",
    "Condition photos from both sides at handoff",
    `${LEVEL_LABEL[lenderLevel(lender)]} lender`,
  ];
  return (
    <div className="text-[11px] leading-snug text-stone-deep">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {lines.map((l) => (
          <li key={l} className="flex gap-1.5">
            <span aria-hidden>·</span>
            {l}
          </li>
        ))}
      </ul>
      <Link href="/standards" className="mt-2 inline-block text-ink underline underline-offset-4 hover:no-underline">
        Dibs standards: verification, condition, handoff checks
      </Link>
    </div>
  );
}

export function LenderCard({ lender }: { lender: Lender }) {
  return (
    <section aria-label="Lender" className="flex gap-4 border border-line p-4">
      <div aria-hidden className="flex size-12 shrink-0 items-center justify-center bg-bone text-[15px] font-medium">
        {lender.avatarInitials}
      </div>
      <div className="min-w-0">
        <p>
          <span className="label">
            {lender.firstName} {lender.lastInitial}. · {lender.school} &apos;{String(lender.gradYear).slice(2)}
          </span>
        </p>
        <VerificationBadge level={lenderLevel(lender)} className="mt-1.5" />
        <p className="mt-1 tabular-nums">
          {lender.rating.toFixed(1)} · {lender.rentalsCompleted} rentals · replies in {lender.responseTime}
        </p>
        <p className="mt-0.5 text-stone-deep">Lending since {lender.joined}</p>
      </div>
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

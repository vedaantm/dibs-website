import clsx from "clsx";
import { CAMPUS } from "@/data/campus";
import type { OrderTotals } from "@/lib/fees";
import { formatCentsExact } from "@/lib/format";

/** Rental subtotal · Dibs fee $0 · tax · DUE TODAY. The deposit hold is a separate box. */
export function SummaryTotals({ totals, className }: { totals: OrderTotals; className?: string }) {
  return (
    <dl className={clsx("flex flex-col gap-1.5", className)}>
      <div className="flex justify-between gap-4">
        <dt>Rental subtotal</dt>
        <dd className="tabular-nums">{formatCentsExact(totals.subtotalCents)}</dd>
      </div>
      <div className="flex justify-between gap-4 text-stone-deep">
        <dt>Dibs fee $0 · free to join</dt>
        <dd className="tabular-nums">{formatCentsExact(totals.feeCents)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Estimated tax ({(CAMPUS.salesTaxRate * 100).toFixed(3)}%)</dt>
        <dd className="tabular-nums">{formatCentsExact(totals.taxCents)}</dd>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <dt className="text-[18px] font-medium uppercase">Due today</dt>
        <dd className="text-[18px] font-medium tabular-nums">{formatCentsExact(totals.dueTodayCents)}</dd>
      </div>
    </dl>
  );
}

export function DepositBox({ cents, className }: { cents: number; className?: string }) {
  return (
    <div className={clsx("border border-line p-4", className)}>
      {cents > 0 ? (
        <>
          <p className="flex justify-between gap-4">
            <span className="label">Deposit hold</span>
            <span className="label tabular-nums">{formatCentsExact(cents)}</span>
          </p>
          <p className="mt-1.5 text-stone-deep">Authorized on your card, not charged. Released within 48 hours of a clean return.</p>
        </>
      ) : (
        <>
          <p className="label">No deposit hold</p>
          <p className="mt-1.5 text-stone-deep">Everything here is under $100 retail, so there&apos;s nothing to hold.</p>
        </>
      )}
    </div>
  );
}

export const TRUST_LINES = [
  "Payment held by Dibs until handoff",
  "Photo check-in at pickup and return",
  ".edu verified lenders only",
];

export function TrustLines({ className }: { className?: string }) {
  return (
    <ul className={clsx("flex flex-col gap-1 text-[11px] text-stone-deep", className)}>
      {TRUST_LINES.map((t) => (
        <li key={t}>· {t}</li>
      ))}
    </ul>
  );
}

import { format } from "date-fns";
import type { Item } from "@/data/types";
import { formatCents } from "@/lib/format";
import type { Quote } from "@/lib/pricing";

/** "Sun, Nov 23 · 10pm" */
export function formatReturnBy(d: Date): string {
  return `${format(d, "EEE, MMM d")} · 10pm`;
}

/** Live quote under the calendar: lines, subtotal, deposit hold, return-by, inline errors. */
export function QuoteBox({ item, quote, pending }: { item: Item; quote: Quote | null; pending?: boolean }) {
  return (
    <div className="border-t border-ink pt-3" aria-live="polite">
      {!quote && (
        <p className="text-stone-deep">{pending ? "Pick a return date to see the price." : "Pick dates to see the price."}</p>
      )}
      {quote && !quote.ok && (
        <p className="text-vermilion-deep" role="alert">
          {quote.error}
        </p>
      )}
      {quote?.ok && (
        <dl className="flex flex-col gap-1">
          {quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-4 text-stone-deep">
              <dt>{l.label}</dt>
              <dd className="tabular-nums">{formatCents(l.total)}</dd>
            </div>
          ))}
          <div className="mt-1 flex justify-between gap-4 border-t border-line pt-2">
            <dt className="label">Subtotal</dt>
            <dd className="label tabular-nums">{formatCents(quote.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-stone-deep">
            <dt>{item.deposit > 0 ? "Deposit (hold, not charged)" : "No deposit — under $100"}</dt>
            <dd className="tabular-nums">{item.deposit > 0 ? formatCents(quote.deposit) : "$0"}</dd>
          </div>
          <div className="flex justify-between gap-4 text-stone-deep">
            <dt>Return by</dt>
            <dd className="tabular-nums">{formatReturnBy(quote.returnBy)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

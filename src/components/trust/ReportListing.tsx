"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Radio, Textarea } from "@/components/ui/Field";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { useHydrated } from "@/lib/hooks";
import { REPORT_REASONS, UNDER_REVIEW_AT, isUnderReview, type ReportReason } from "@/lib/trust";
import { allReports, useReports } from "@/store/trust";

export function useUnderReview(slug: string): boolean {
  const hydrated = useHydrated();
  const local = useReports((s) => s.reports);
  return hydrated && isUnderReview(slug, allReports(local));
}

/** Shown on the product page when the listing has 2+ open reports. */
export function UnderReviewNotice({ slug }: { slug: string }) {
  const under = useUnderReview(slug);
  if (!under) return null;
  return (
    <div role="status" className="border border-ink p-4">
      <p className="label">Under review</p>
      <p className="mt-1 text-stone-deep">
        This listing has {UNDER_REVIEW_AT}+ open reports, so it can&apos;t be booked until Dibs checks it with the lender. Usually within a day.
      </p>
    </div>
  );
}

/** "Report this listing" text link + a small sheet. Saving keeps the report in this browser. */
export function ReportListing({ slug, name }: { slug: string; name: string }) {
  const hydrated = useHydrated();
  const add = useReports((s) => s.add);
  const mine = useReports((s) => s.reports.some((r) => r.slug === slug && r.status === "open")) && hydrated;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const close = () => {
    setOpen(false);
    setErr(null);
  };

  return (
    <div>
      {mine ? (
        <p className="text-[12px] text-stone-deep">You reported this listing. Dibs reviews reports within a day.</p>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="text-[12px] text-stone-deep underline underline-offset-4 hover:text-ink">
          Report this listing
        </button>
      )}
      <Sheet open={open} onClose={close} side="center" label="Report this listing">
        <SheetHeader title="Report this listing" onClose={close} />
        {sent ? (
          <div className="flex flex-col gap-4 px-4 py-6 md:px-6">
            <p role="status">Thanks. Dibs reviews reports within a day. Two open reports pull a listing from booking until it&apos;s checked.</p>
            <p className="text-[12px] text-stone-deep">Pilot preview: the report is saved in this browser only.</p>
            <Button variant="outline" onClick={close} className="self-start">
              Done
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-5 overflow-y-auto px-4 py-6 md:px-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reason) return setErr("Pick a reason.");
              if (reason === "other" && !note.trim()) return setErr("Tell us what's wrong.");
              add(slug, reason, note.slice(0, 300));
              setSent(true);
            }}
          >
            <p className="text-stone-deep">{name}</p>
            <fieldset>
              <legend className="label mb-3">What&apos;s wrong?</legend>
              <div className="flex flex-col gap-3">
                {REPORT_REASONS.map((r) => (
                  <Radio
                    key={r.id}
                    id={`report-${r.id}`}
                    name="report-reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => {
                      setReason(r.id);
                      setErr(null);
                    }}
                    label={r.label}
                  />
                ))}
              </div>
            </fieldset>
            <Field label={reason === "other" ? "Details" : "Details (optional)"} htmlFor="report-note" hint="What you saw, and when.">
              <Textarea id="report-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
            </Field>
            {err && (
              <p role="alert" className="text-[12px] text-vermilion-deep">
                {err}
              </p>
            )}
            <Button type="submit" className="self-start">
              Send report
            </Button>
          </form>
        )}
      </Sheet>
    </div>
  );
}

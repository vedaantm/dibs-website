"use client";

import clsx from "clsx";
import { Camera } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Radio, Textarea } from "@/components/ui/Field";
import { getLender, getItem } from "@/lib/catalog";
import { formatCentsExact } from "@/lib/format";
import { NOTE_MAX, SIDES, STAGES, cancelsRental, nextCheck, stageState, validateSideCheck, type Side, type SideCheck, type Stage, type StageCheck, type Verdict } from "@/lib/handoff";
import type { Order } from "@/lib/order";
import { photoToDataUrl } from "@/lib/photo";
import { useOrders } from "@/store/orders";

const STAGE_LABEL: Record<Stage, string> = { pickup: "Pickup", return: "Return" };

function sideLabel(side: Side, lenderName: string) {
  return side === "renter" ? "You" : lenderName;
}

/** One side's photo + verdict, 2:3 on blush. */
function Slot({ check, who }: { check?: SideCheck; who: string }) {
  return (
    <figure className="min-w-0">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-blush">
        {check ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL, never uploaded
          <img src={check.photo} alt={`Condition photo from ${who}`} className="size-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-center text-[11px] text-stone-deep">Waiting</span>
        )}
      </div>
      <figcaption className="mt-1.5 text-[11px] leading-snug">
        <span className="label block truncate text-[11px]">{who}</span>
        {check && (
          <span className={clsx("block", check.verdict === "mismatch" ? "text-vermilion-deep" : "text-stone-deep")}>
            {check.verdict === "match" ? "Matches the listing" : "Doesn't match"}
            {check.note ? `: ${check.note}` : ""}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

function StageColumn({ stage, s, lenderName }: { stage: Stage; s?: StageCheck; lenderName: string }) {
  const state = stageState(s);
  return (
    <div className="min-w-0">
      <p className="eyebrow mb-2 flex flex-wrap justify-between gap-x-2 text-ink">
        <span>{STAGE_LABEL[stage]}</span>
        <span className={clsx(state === "mismatch" ? "text-vermilion-deep" : "text-stone-deep")}>
          {state === "matched" ? "Both confirmed" : state === "mismatch" ? "Doesn't match" : state === "partial" ? "1 of 2" : "Not yet"}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SIDES.map((side) => (
          <Slot key={side} check={s?.[side]} who={sideLabel(side, lenderName)} />
        ))}
      </div>
    </div>
  );
}

function CheckForm({ order, stage, side, lenderName }: { order: Order; stage: Stage; side: Side; lenderName: string }) {
  const uid = useId();
  const record = useOrders((s) => s.recordCheck);
  const [photo, setPhoto] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const who = side === "renter" ? "Your check" : `${lenderName}'s check`;

  return (
    <form
      className="flex flex-col gap-4 border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const v = validateSideCheck({ photo, verdict, note });
        if (v) return setErr(v);
        try {
          record(order.id, stage, side, { photo: photo!, verdict: verdict!, note: note.trim() || undefined, at: new Date().toISOString() });
        } catch {
          setErr("This browser's storage is full. Clear an old order and try again.");
        }
      }}
    >
      <p className="label">
        {STAGE_LABEL[stage]} check · {who}
      </p>
      {side === "lender" && <p className="-mt-2 text-[12px] text-stone-deep">On the day, {lenderName} does this on their phone. For the demo, fill it in here.</p>}
      <div className="flex items-center gap-4">
        <label htmlFor={`${uid}-photo`} className="flex h-24 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-stone bg-blush hover:border-ink">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview
            <img src={photo} alt="Your condition photo" className="size-full object-cover" />
          ) : (
            <Camera size={18} strokeWidth={1.25} aria-hidden />
          )}
        </label>
        <div className="flex flex-col gap-0.5">
          <label htmlFor={`${uid}-photo`} className="label cursor-pointer underline underline-offset-4 hover:no-underline">
            {photo ? "Retake photo" : busy ? "Processing…" : "Take condition photo"}
          </label>
          <span className="text-[12px] text-stone-deep">Whole item, plus anything the listing&apos;s close-up shows. Stays in this browser.</span>
        </div>
        <input
          id={`${uid}-photo`}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f || !f.type.startsWith("image/")) return;
            setBusy(true);
            try {
              setPhoto(await photoToDataUrl(f));
              setErr(null);
            } catch {
              setErr("Couldn't read that photo. Try another.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      <fieldset>
        <legend className="sr-only">Does the item match the listing?</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <Radio id={`${uid}-match`} name={`${uid}-verdict`} checked={verdict === "match"} onChange={() => setVerdict("match")} label="Matches the listing" />
          <Radio id={`${uid}-mismatch`} name={`${uid}-verdict`} checked={verdict === "mismatch"} onChange={() => setVerdict("mismatch")} label="Doesn't match" />
        </div>
      </fieldset>
      <Field label={verdict === "mismatch" ? "What's different" : "Note (optional)"} htmlFor={`${uid}-note`} hint={`${note.length} / ${NOTE_MAX}`}>
        <Textarea id={`${uid}-note`} value={note} onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))} className="min-h-16" />
      </Field>
      {verdict && cancelsRental(stage, verdict) && (
        <p className="text-[12px]">
          Saving this cancels the rental. You get {formatCentsExact(order.totals.dueTodayCents)} back in full and the deposit hold is released.
        </p>
      )}
      {err && (
        <p role="alert" className="text-[12px] text-vermilion-deep">
          {err}
        </p>
      )}
      <Button type="submit" variant="outline" className="self-start" disabled={busy}>
        Save check
      </Button>
    </form>
  );
}

/** Pickup + return photo sets side by side, and the next check to fill in. */
export function ConditionCheck({ order }: { order: Order }) {
  const lender = getLender(getItem(order.lines[0].slug)?.lenderId ?? "");
  const lenderName = lender ? `${lender.firstName} ${lender.lastInitial}.` : "Lender";
  const next = order.cancelledAt ? null : nextCheck(order.checks);
  const pickup = stageState(order.checks?.pickup);
  const ret = stageState(order.checks?.return);

  return (
    <section aria-label={`Condition check for order ${order.id}`} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 md:max-w-xl md:gap-6">
        {STAGES.map((stage) => (
          <StageColumn key={stage} stage={stage} s={order.checks?.[stage]} lenderName={lenderName} />
        ))}
      </div>
      {order.cancelledAt ? (
        <p role="status" className="border-l-2 border-vermilion-deep pl-3">
          <span className="label">Rental cancelled at pickup.</span> {formatCentsExact(order.refundCents ?? order.totals.dueTodayCents)} refunded in full
          {order.depositHold > 0 ? ", deposit hold released" : ""}. The listing goes to Dibs for review.
        </p>
      ) : ret === "mismatch" ? (
        <p role="status" className="border-l-2 border-vermilion-deep pl-3">
          <span className="label">Flagged at return.</span> Dibs compares the two photo sets. The deposit stays on hold until a person reviews it, within 2 days.
        </p>
      ) : ret === "matched" ? (
        <p role="status" className="text-stone-deep">
          Both sides confirmed at return. {order.depositHold > 0 ? "The deposit hold drops off within 48 hours. " : ""}You can now review the item.
        </p>
      ) : pickup === "matched" ? (
        <p className="text-stone-deep">Pickup confirmed by both sides. Payment released to the lender.</p>
      ) : null}
      {next && <CheckForm key={`${next.stage}-${next.side}`} order={order} stage={next.stage} side={next.side} lenderName={lenderName} />}
    </section>
  );
}

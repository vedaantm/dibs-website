"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PICKUP_SPOTS } from "@/data/campus";
import { toISODate, today } from "@/lib/dates";
import { useHydrated } from "@/lib/hooks";

/** Fallback when browsing comes up empty. Nothing is sent anywhere. */
export function RequestForm() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [what, setWhat] = useState(params.get("q") ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [max, setMax] = useState("");
  const [spot, setSpot] = useState("bobst");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const min = hydrated ? toISODate(today()) : undefined;

  if (sent) {
    return (
      <div role="status" className="max-w-xl border-t border-ink pt-6">
        <p className="text-[22px] font-medium uppercase">Request posted.</p>
        <p className="mt-2">
          We&apos;ll ping lenders who have one. You&apos;ll hear back by text, usually within a day. Looking for &ldquo;{what}&rdquo;
          {from && to ? `, ${from} to ${to}` : ""}.
        </p>
        <p className="mt-2 text-[12px] text-stone-deep">Pilot preview: nothing was sent anywhere.</p>
        <div className="mt-6 flex gap-4">
          <ButtonLink href="/shop">Keep browsing</ButtonLink>
          <Button variant="outline" onClick={() => setSent(false)}>
            Request something else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="grid max-w-xl gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!what.trim()) errs.what = "What do you need?";
        if (from && to && to < from) errs.to = "Return date is before the pickup date.";
        setErrors(errs);
        if (Object.keys(errs).length === 0) setSent(true);
      }}
    >
      <Field label="What you need" htmlFor="rq-what" error={errors.what} hint="Be specific: edition, size, model.">
        <Input
          id="rq-what"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="Tuxedo 38R, or Molecular Biology of the Cell 7e"
          aria-invalid={Boolean(errors.what) || undefined}
          aria-describedby={errors.what ? "rq-what-error" : "rq-what-hint"}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="From" htmlFor="rq-from">
          <Input id="rq-from" type="date" min={min} value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="rq-to" error={errors.to}>
          <Input id="rq-to" type="date" min={from || min} value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={Boolean(errors.to) || undefined} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Max price per day" htmlFor="rq-max">
          <div className="relative">
            <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-deep">
              $
            </span>
            <Input id="rq-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="20" className="pl-6 tabular-nums" />
          </div>
        </Field>
        <Field label="Pickup spot" htmlFor="rq-spot">
          <Select id="rq-spot" value={spot} onChange={(e) => setSpot(e.target.value)}>
            {PICKUP_SPOTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button type="submit" className="justify-self-start">
        Post request
      </Button>
      <p className="text-[12px] text-stone-deep">We&apos;ll ping lenders who have one. Pilot preview: nothing is sent anywhere.</p>
    </form>
  );
}

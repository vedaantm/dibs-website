"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { PickupSpotId } from "@/data/types";
import type { BagLine } from "@/lib/bag";
import { getItem, getPickupSpot } from "@/lib/catalog";
import { fromISODate } from "@/lib/dates";
import { formatDay } from "@/lib/format";
import { WINDOWS, groupHandoffs } from "@/lib/order";
import { useBag } from "@/store/bag";
import { useCheckout } from "@/store/checkout";

function Chips({
  label,
  value,
  onChange,
  name,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name: string;
  invalid?: boolean;
}) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2 text-ink">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {WINDOWS.map((w) => (
          <label key={w.id} className="cursor-pointer">
            <input type="radio" name={name} value={w.id} checked={value === w.id} onChange={() => onChange(w.id)} className="peer sr-only" />
            <span
              className={clsx(
                "inline-flex h-9 items-center border px-3 text-[12px] tabular-nums transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy",
                value === w.id ? "border-ink bg-ink text-paper" : invalid ? "border-vermilion-deep hover:border-ink" : "border-line hover:border-ink",
              )}
            >
              {w.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function spotChoices(lines: BagLine[]): PickupSpotId[] {
  // spots every line in the group can use
  const sets = lines.map((l) => getItem(l.slug)!.pickupSpotIds);
  return sets.reduce((acc, s) => acc.filter((x) => s.includes(x)));
}

export function StepHandoff() {
  const c = useCheckout();
  const lines = useBag((s) => s.lines);
  const updatePickup = useBag((s) => s.updatePickup);
  const groups = groupHandoffs(lines);
  const [showErrors, setShowErrors] = useState(false);

  const missing = groups.filter((g) => {
    const ch = c.choices[g.key];
    return !ch?.pickupWindow || !ch?.returnWindow || (ch.dormOn && !ch.dorm?.trim());
  });

  return (
    <div className="flex flex-col gap-8">
      {groups.map((g, gi) => {
        const ch = c.choices[g.key] ?? { pickupWindow: "", returnWindow: "" };
        const first = g.lines[0];
        const spot = getPickupSpot(first.pickupSpotId)!;
        const options = spotChoices(g.lines);
        const err = showErrors && missing.includes(g);
        return (
          <fieldset key={g.key} className="border border-line p-4 md:p-6">
            <legend className="eyebrow bg-paper px-2 text-ink">
              Handoff {gi + 1} of {groups.length}
            </legend>
            <ul className="mb-5 flex flex-col gap-0.5">
              {g.lines.map((l) => (
                <li key={l.id} className="label truncate">
                  {getItem(l.slug)!.name}
                </li>
              ))}
            </ul>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Pickup spot" htmlFor={`ho-spot-${gi}`} hint={spot.note}>
                <Select
                  id={`ho-spot-${gi}`}
                  value={first.pickupSpotId}
                  disabled={Boolean(ch.dormOn)}
                  onChange={(e) => g.lines.forEach((l) => updatePickup(l.id, e.target.value as PickupSpotId))}
                >
                  {options.map((id) => (
                    <option key={id} value={id}>
                      {getPickupSpot(id)!.name} — {getPickupSpot(id)!.address}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className="eyebrow text-ink">Pickup day</span>
                <p className="flex h-12 items-center border border-line px-3 tabular-nums">{formatDay(fromISODate(first.start))}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-5">
              <Chips
                label={`Pickup window · ${formatDay(fromISODate(first.start))}`}
                name={`ho-pick-${gi}`}
                value={ch.pickupWindow}
                invalid={err && !ch.pickupWindow}
                onChange={(v) => c.setChoice(g.key, { pickupWindow: v })}
              />
              <Chips
                label={`Return window · ${formatDay(fromISODate(first.quote.returnBy))}`}
                name={`ho-ret-${gi}`}
                value={ch.returnWindow}
                invalid={err && !ch.returnWindow}
                onChange={(v) => c.setChoice(g.key, { returnWindow: v })}
              />
              <Checkbox
                id={`ho-dorm-${gi}`}
                label="Meet at my dorm lobby instead"
                description="Lender confirms within 2 hours"
                checked={Boolean(ch.dormOn)}
                onChange={(e) => c.setChoice(g.key, { dormOn: e.target.checked })}
              />
              {ch.dormOn && (
                <Field label="Dorm name" htmlFor={`ho-dormname-${gi}`} error={err && !ch.dorm?.trim() ? "Which dorm?" : undefined}>
                  <Input
                    id={`ho-dormname-${gi}`}
                    autoComplete="off"
                    placeholder="e.g. Third North"
                    value={ch.dorm ?? ""}
                    onChange={(e) => c.setChoice(g.key, { dorm: e.target.value })}
                  />
                </Field>
              )}
            </div>
            {err && (
              <p role="alert" className="mt-4 text-[12px] text-vermilion-deep">
                Pick a pickup and a return window for this handoff.
              </p>
            )}
          </fieldset>
        );
      })}

      <Field label="Note for the lender (optional)" htmlFor="ho-note" hint={`${c.note.length} / 200`}>
        <Textarea
          id="ho-note"
          maxLength={200}
          value={c.note}
          onChange={(e) => c.set({ note: e.target.value.slice(0, 200) })}
          placeholder="Running from a 1pm class, might be 5 minutes late."
          aria-describedby="ho-note-hint"
        />
      </Field>

      <Button
        className="self-start"
        onClick={() => {
          setShowErrors(true);
          if (missing.length === 0) c.complete(2);
        }}
      >
        Continue to protection
      </Button>
    </div>
  );
}

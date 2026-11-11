"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { detectBrand, formatCardNumber, formatExpiry, validateCard, type CardErrors, type CardFields } from "@/lib/card";
import { formatCentsExact } from "@/lib/format";
import { useCheckout } from "@/store/checkout";

const EMPTY: CardFields = { number: "", expiry: "", cvc: "", zip: "" };
const DEMO: CardFields = { number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123", zip: "10012" };

/**
 * Mock payment. Card fields live in this component's state only: never stored, logged or sent.
 * They are cleared after a successful hold and vanish with the component on unmount.
 */
export function StepPayment({ dueCents, onPlace }: { dueCents: number; onPlace: () => Promise<void> }) {
  const demoFill = useCheckout((s) => s.demoFill);
  const [card, setCard] = useState<CardFields>(demoFill ? DEMO : EMPTY);
  const [errors, setErrors] = useState<CardErrors>({});
  const [phase, setPhase] = useState<null | "auth" | "confirm">(null);

  const brand = detectBrand(card.number);
  const set = (k: keyof CardFields, v: string) => {
    setCard((c) => ({ ...c, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCard(card);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPhase("auth");
    await new Promise((r) => setTimeout(r, 750));
    setPhase("confirm");
    await new Promise((r) => setTimeout(r, 750));
    setCard(EMPTY);
    await onPlace();
  };

  const err = (k: keyof CardFields) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `pay-${k}-error` } : {});

  return (
    <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-5" autoComplete="on">
      <p className="eyebrow border-y border-line py-2 text-center text-ink">Demo checkout — no real payment is taken.</p>

      <div className="relative inline-flex self-stretch">
        <Button variant="outline" full aria-disabled="true" aria-describedby="applepay-tip" className="peer cursor-not-allowed opacity-50" onClick={(e) => e.preventDefault()}>
          Pay with Apple Pay
        </Button>
        <span
          id="applepay-tip"
          role="tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink px-2 py-1 text-[11px] text-paper opacity-0 transition-opacity duration-200 peer-hover:opacity-100 peer-focus-visible:opacity-100"
        >
          Available at launch
        </span>
      </div>
      <p className="eyebrow text-center text-stone-deep">Or pay by card</p>

      <Field label="Card number" htmlFor="pay-number" error={errors.number} hint={brand ?? "Visa, Mastercard, Amex"}>
        <div className="relative">
          <Input
            id="pay-number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={card.number}
            onChange={(e) => set("number", formatCardNumber(e.target.value))}
            className="pr-24 tabular-nums"
            {...err("number")}
          />
          {brand && <span className="eyebrow absolute right-3 top-1/2 -translate-y-1/2 border border-ink px-1.5 py-0.5 text-ink">{brand}</span>}
        </div>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Expiry" htmlFor="pay-expiry" error={errors.expiry}>
          <Input
            id="pay-expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={card.expiry}
            onChange={(e) => set("expiry", formatExpiry(e.target.value))}
            className="tabular-nums"
            {...err("expiry")}
          />
        </Field>
        <Field label="CVC" htmlFor="pay-cvc" error={errors.cvc}>
          <Input
            id="pay-cvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={card.cvc}
            onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="tabular-nums"
            {...err("cvc")}
          />
        </Field>
        <Field label="Billing ZIP" htmlFor="pay-zip" error={errors.zip}>
          <Input
            id="pay-zip"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="10012"
            maxLength={5}
            value={card.zip}
            onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="tabular-nums"
            {...err("zip")}
          />
        </Field>
      </div>
      <p className="text-[12px] text-stone-deep">Billing ZIP only. Nothing ships, so we don&apos;t need an address.</p>

      <Button type="submit" full loading={phase !== null}>
        {phase === "auth" ? "Authorizing deposit…" : phase === "confirm" ? "Confirming with lenders…" : `Place hold & pay ${formatCentsExact(dueCents)}`}
      </Button>
      <p className="sr-only" aria-live="assertive">
        {phase === "auth" ? "Authorizing deposit" : phase === "confirm" ? "Confirming with lenders" : ""}
      </p>
    </form>
  );
}

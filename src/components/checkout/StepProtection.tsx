"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { formatCentsExact } from "@/lib/format";
import { useCheckout } from "@/store/checkout";
import { PolicyText } from "./PolicyText";

export function StepProtection({ depositCents }: { depositCents: number }) {
  const c = useCheckout();
  const [policy, setPolicy] = useState<null | "terms" | "deposit">(null);
  const [showErr, setShowErr] = useState(false);

  const rows = [
    depositCents > 0
      ? `Deposit hold ${formatCentsExact(depositCents)} — authorized, not charged`
      : "No deposit hold — everything here is under $100",
    "Photo check-in at pickup and return — both of you snap the item in the app",
    "Late fee 1.5× day rate, taken from the deposit",
    "Payment held by Dibs — the lender is paid only after you scan the handoff code. If the item isn't as pictured, you get it back.",
  ];

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <ul className="border-t border-line">
        {rows.map((r) => (
          <li key={r} className="border-b border-line py-3">
            {r}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <Checkbox
          id="pr-photo"
          label="I'll do the photo check-in at pickup and return"
          checked={c.photoAgree}
          aria-invalid={(showErr && !c.photoAgree) || undefined}
          onChange={(e) => c.set({ photoAgree: e.target.checked })}
        />
        <Checkbox
          id="pr-terms"
          checked={c.termsAgree}
          aria-invalid={(showErr && !c.termsAgree) || undefined}
          onChange={(e) => c.set({ termsAgree: e.target.checked })}
          label={
            <>
              I agree to the{" "}
              <button type="button" onClick={(e) => (e.preventDefault(), setPolicy("terms"))} className="underline underline-offset-4 hover:no-underline">
                rental terms
              </button>{" "}
              and the{" "}
              <button type="button" onClick={(e) => (e.preventDefault(), setPolicy("deposit"))} className="underline underline-offset-4 hover:no-underline">
                deposit &amp; damage policy
              </button>
            </>
          }
        />
        {showErr && (!c.photoAgree || !c.termsAgree) && (
          <p role="alert" className="text-[12px] text-vermilion-deep">
            Both boxes are required.
          </p>
        )}
      </div>
      <Button
        className="self-start"
        onClick={() => {
          setShowErr(true);
          if (c.photoAgree && c.termsAgree) c.complete(3);
        }}
      >
        Continue to payment
      </Button>

      <Sheet open={policy !== null} onClose={() => setPolicy(null)} side="right" label="Policy" className="w-full md:w-[520px]" layer="z-[60]">
        <SheetHeader title={policy === "terms" ? "Rental terms" : "Deposit & damage policy"} onClose={() => setPolicy(null)} />
        <div className="overflow-y-auto px-4 py-6 md:px-6">{policy && <PolicyText which={policy} />}</div>
      </Sheet>
    </div>
  );
}

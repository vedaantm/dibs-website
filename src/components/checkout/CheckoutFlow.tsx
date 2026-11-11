"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Toast } from "@/components/ui/Toast";
import { bagTotals } from "@/lib/bag";
import { getPickupSpot } from "@/lib/catalog";
import { orderTotals } from "@/lib/fees";
import { useHydrated } from "@/lib/hooks";
import { buildOrder, groupHandoffs, windowLabel } from "@/lib/order";
import { useBag } from "@/store/bag";
import { useCheckout, type StepId } from "@/store/checkout";
import { useOrders } from "@/store/orders";
import { OrderSummary } from "./OrderSummary";
import { StepHandoff } from "./StepHandoff";
import { StepPayment } from "./StepPayment";
import { StepProtection } from "./StepProtection";
import { StepShell } from "./StepShell";
import { DEMO_EMAIL, StepVerify } from "./StepVerify";

export function CheckoutFlow() {
  const hydrated = useHydrated();
  const router = useRouter();
  const params = useSearchParams();
  const lines = useBag((s) => s.lines);
  const clearBag = useBag((s) => s.clear);
  const addOrder = useOrders((s) => s.add);
  const c = useCheckout();
  const placing = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const demo = params.get("demo") === "fill";

  // /checkout?demo=fill pre-fills step 01 (email + code) and step 04 (test card).
  useEffect(() => {
    if (!hydrated || !demo || c.demoFill) return;
    c.set({ demoFill: true, email: DEMO_EMAIL, codeSent: true, name: c.name || "Maya K.", phone: c.phone || "(212) 555-0134" });
  }, [hydrated, demo, c]);

  const t = bagTotals(lines);
  const empty = lines.length === 0;
  useEffect(() => {
    if (!hydrated || placing.current) return;
    if (empty || t.hasIssues) router.replace("/bag");
  }, [hydrated, empty, t.hasIssues, router]);

  if (!hydrated || empty) return <Container className="h-[70svh]" aria-busy="true" />;

  const totals = orderTotals(lines.map((l) => ({ subtotalCents: l.quote.subtotal, depositCents: l.quote.deposit })));
  const groups = groupHandoffs(lines);
  const state = (n: StepId) => (c.step === n ? "open" : n <= c.done ? "done" : "locked");

  const place = async () => {
    placing.current = true;
    const order = buildOrder({
      lines,
      choices: c.choices,
      email: c.email,
      name: c.name,
      phone: c.phone,
      note: c.note,
      now: new Date(),
    });
    addOrder(order);
    router.push(`/checkout/confirmed?order=${order.id}`);
    clearBag();
    c.reset();
  };

  const handoffSummary = groups
    .map((g) => {
      const ch = c.choices[g.key];
      const spot = ch?.dormOn && ch.dorm ? ch.dorm : getPickupSpot(g.lines[0].pickupSpotId)?.shortName;
      return `${spot} · ${windowLabel(ch?.pickupWindow)}`;
    })
    .join(" / ");

  return (
    <Container className="pb-16">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] lg:gap-12">
        <div className="order-2 min-w-0 lg:order-1">
          <StepShell n={1} title="Verify" state={state(1)} summary={`Verified — ${c.email.trim().toLowerCase()} · ${c.name}`} onEdit={() => c.goTo(1)}>
            <StepVerify key={c.demoFill ? "demo" : "plain"} onToast={setToast} />
          </StepShell>
          <StepShell n={2} title="Handoff" state={state(2)} summary={handoffSummary} onEdit={() => c.goTo(2)}>
            <StepHandoff />
          </StepShell>
          <StepShell n={3} title="Protection" state={state(3)} summary="Photo check-in and terms agreed" onEdit={() => c.goTo(3)}>
            <StepProtection depositCents={totals.depositHoldCents} />
          </StepShell>
          <StepShell n={4} title="Payment" state={state(4)}>
            <StepPayment dueCents={totals.dueTodayCents} onPlace={place} />
          </StepShell>
        </div>
        <div className="order-1 -mx-4 lg:order-2 lg:mx-0 lg:pt-6">
          <OrderSummary
            className="lg:sticky lg:top-6"
            totals={totals}
            lines={lines.map((l) => ({ key: l.id, slug: l.slug, start: l.start, end: l.end, plan: l.plan, pickupSpotId: l.pickupSpotId, subtotal: l.quote.subtotal }))}
          />
        </div>
      </div>
      <Toast message={toast} onClose={closeToast} />
    </Container>
  );
}

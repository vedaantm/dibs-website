"use client";

import { addDays, format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { getItem, getLender, getPickupSpot } from "@/lib/catalog";
import { fromISODate } from "@/lib/dates";
import { useHydrated } from "@/lib/hooks";
import { buildIcs } from "@/lib/ics";
import { WINDOWS, orderSpan, windowLabel, type Order } from "@/lib/order";
import { useOrders } from "@/store/orders";
import { HandoffCode } from "./HandoffCode";

const day = (iso: string) => format(fromISODate(iso), "EEE, MMM d");

function lenderNames(o: Order): string {
  const names = [...new Set(o.lines.map((l) => getLender(getItem(l.slug)!.lenderId)!.firstName))];
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function downloadIcs(o: Order) {
  const events = o.lines.flatMap((l) => {
    const item = getItem(l.slug)!;
    const spot = getPickupSpot(l.pickupSpotId)!;
    const where = l.dorm ? `${l.dorm} lobby` : `${spot.name}, ${spot.address}, New York, NY`;
    const pick = WINDOWS.find((w) => w.id === l.pickupWindow)?.hour ?? 14;
    const ret = WINDOWS.find((w) => w.id === l.returnWindow)?.hour ?? 21;
    return [
      {
        uid: `${o.id}-${l.slug}-pickup@dibs`,
        title: `Dibs pickup: ${item.brand} ${item.name}`,
        date: l.start,
        hour: pick,
        durationMin: 60,
        location: where,
        description: `Order ${o.id}. Handoff code ${o.handoffCode}. ${spot.note}.`,
      },
      {
        uid: `${o.id}-${l.slug}-return@dibs`,
        title: `Dibs return: ${item.brand} ${item.name}`,
        date: l.returnBy,
        hour: ret,
        durationMin: 60,
        location: where,
        description: `Order ${o.id}. Return by 10pm. Photo check-in at return.`,
      },
    ];
  });
  const blob = new Blob([buildIcs(events, new Date())], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dibs-${o.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Timeline({ o }: { o: Order }) {
  const first = [...o.lines].sort((a, b) => a.start.localeCompare(b.start))[0];
  const spot = getPickupSpot(first.pickupSpotId)!;
  const { returnBy } = orderSpan(o);
  const steps = [
    { title: "Hold placed", when: `Today · ${format(new Date(o.createdAt), "EEE, MMM d")}` },
    { title: "Pickup", when: `${day(first.start)} · ${windowLabel(first.pickupWindow)} · ${first.dorm ? `${first.dorm} lobby` : spot.name}` },
    { title: "Return", when: `${day(returnBy)} · by 10pm` },
    { title: "Deposit released", when: o.depositHold > 0 ? `by ${format(addDays(fromISODate(returnBy), 2), "EEE, MMM d")}` : "No deposit on this order" },
  ];
  return (
    <ol className="grid gap-0 md:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 pb-8 md:flex-col md:gap-0 md:pb-0 md:pr-6">
          {/* hairline connector: vertical on mobile, horizontal on desktop */}
          {i < steps.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 h-full w-px bg-line md:left-4 md:top-[5px] md:h-px md:w-full" />}
          <span aria-hidden className={`relative z-[1] mt-1 size-[11px] shrink-0 border border-ink ${i === 0 ? "bg-ink" : "bg-paper"}`} />
          <div className="md:mt-4">
            <p className="label">{s.title}</p>
            <p className="mt-1 tabular-nums text-stone-deep">{s.when}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Confirmation() {
  const hydrated = useHydrated();
  const id = useSearchParams().get("order") ?? "";
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  if (!hydrated) return <div className="h-[60svh] bg-lastlight" aria-busy="true" />;
  if (!order) {
    return (
      <Container className="py-20">
        <Eyebrow>Order {id || "not found"}</Eyebrow>
        <h1 className="section-title mt-3">We can&apos;t find that order.</h1>
        <p className="mt-3 max-w-md text-stone-deep">Orders live in this browser during the pilot. Check My Dibs, or start a new one.</p>
        <div className="mt-8 flex gap-4">
          <ButtonLink href="/account">View my dibs</ButtonLink>
          <ButtonLink href="/shop" variant="outline">
            Shop all
          </ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <>
      <section className="on-dark bg-lastlight grain flex min-h-[60svh] flex-col justify-end text-paper">
        <Container className="relative z-[2] pb-12 pt-24 md:pb-16">
          <Eyebrow tone="paper">Order {order.id}</Eyebrow>
          <h1 className="mt-4 text-[44px] font-medium uppercase leading-[0.95] tracking-[-0.02em] md:text-[64px]">You&apos;ve got dibs.</h1>
          <p className="mt-4 max-w-lg text-[15px] text-paper/90">
            We&apos;ve texted {lenderNames(order)}. You&apos;ll get a confirmation within 2 hours.
          </p>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <Timeline o={order} />
      </Container>

      <Container className="grid gap-12 border-t border-line pb-20 pt-12 lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] lg:gap-12 lg:pb-28">
        <div>
          <HandoffCode orderId={order.id} code={order.handoffCode} />
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button onClick={() => downloadIcs(order)}>Add to calendar</Button>
            <ButtonLink href="/account" variant="outline">
              View my dibs
            </ButtonLink>
            <ButtonLink href="/shop" variant="text">
              Keep browsing
            </ButtonLink>
          </div>
          {order.note && (
            <p className="mt-8 max-w-md border-l border-ink pl-4 text-stone-deep">
              Your note: &ldquo;{order.note}&rdquo;
            </p>
          )}
        </div>
        <OrderSummary
          totals={order.totals}
          lines={order.lines.map((l, i) => ({
            key: `${l.slug}-${i}`,
            slug: l.slug,
            start: l.start,
            end: l.end,
            plan: l.plan,
            pickupSpotId: l.pickupSpotId,
            subtotal: l.subtotal,
            extra: `${windowLabel(l.pickupWindow)}${l.dorm ? ` · ${l.dorm} lobby` : ""}`,
          }))}
        />
      </Container>
    </>
  );
}

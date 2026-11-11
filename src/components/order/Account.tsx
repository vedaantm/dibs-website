"use client";

import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { lineDatesText } from "@/components/bag/LineDates";
import { ItemImage } from "@/components/product/ItemImage";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";
import { getItem, getPickupSpot } from "@/lib/catalog";
import { toISODate, today } from "@/lib/dates";
import { formatCentsExact } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { STATUS_LABEL, orderStatus, windowLabel, type Order } from "@/lib/order";
import { useOrders } from "@/store/orders";
import { HandoffCode } from "./HandoffCode";

function OrderRow({ o, todayISO }: { o: Order; todayISO: string }) {
  const [show, setShow] = useState(false);
  const status = orderStatus(o, todayISO);
  return (
    <li className="border-b border-line py-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-2">
          {o.lines.slice(0, 4).map((l, i) => (
            <div key={i} className="w-14 shrink-0 md:w-16">
              <ItemImage item={getItem(l.slug)!} bare sizes="64px" />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/checkout/confirmed?order=${o.id}`} className="label underline-offset-4 hover:underline">
              Order {o.id}
            </Link>
            <Tag tone={status === "returned" ? "ink" : "navy"}>{STATUS_LABEL[status]}</Tag>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {o.lines.map((l, i) => (
              <li key={i} className="text-stone-deep">
                <span className="text-ink">{getItem(l.slug)!.name}</span> · <span className="tabular-nums">{lineDatesText(l)}</span> ·{" "}
                {l.dorm ? `${l.dorm} lobby` : getPickupSpot(l.pickupSpotId)?.name} · {windowLabel(l.pickupWindow)}
              </li>
            ))}
          </ul>
          <p className="mt-2 tabular-nums text-stone-deep">
            Paid {formatCentsExact(o.totals.dueTodayCents)}
            {o.depositHold > 0 ? ` · Deposit hold ${formatCentsExact(o.depositHold)}` : ""}
          </p>
        </div>
        {status !== "returned" && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-expanded={show}
            className="label shrink-0 self-start underline underline-offset-4 hover:no-underline"
          >
            {show ? "Hide handoff code" : "Show handoff code"}
          </button>
        )}
      </div>
      {show && (
        <div className="mt-6">
          <HandoffCode orderId={o.id} code={o.handoffCode} size="sm" />
        </div>
      )}
    </li>
  );
}

export function Account() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  if (!hydrated) return <Container className="h-[60svh]" aria-busy="true" />;

  const todayISO = toISODate(today());
  const upcoming = orders.filter((o) => orderStatus(o, todayISO) !== "returned");
  const past = orders.filter((o) => orderStatus(o, todayISO) === "returned");
  const latest = orders[0];
  const name = latest?.name || "Guest";
  const email = latest?.email;
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const empty = (text: string) => (
    <div>
      <p>{text}</p>
      <ButtonLink href="/shop" variant="outline" className="mt-6">
        Shop all
      </ButtonLink>
    </div>
  );

  return (
    <Container className="pb-24 pt-10 md:pt-14">
      <h1 className="section-title">My Dibs</h1>
      <section aria-label="Profile" className="mt-8 flex items-center gap-4 border-y border-line py-6">
        <div aria-hidden className="flex size-14 items-center justify-center bg-bone text-[18px] font-medium">
          {initials}
        </div>
        <div>
          <p className="flex items-center gap-1.5">
            <span className="label">{name}</span>
            {email && <BadgeCheck size={16} strokeWidth={1.5} className="text-navy" role="img" aria-label="Verified NYU student" />}
          </p>
          <p className="text-stone-deep">{email ?? "Verify your NYU email at checkout to rent."}</p>
          <p className="text-stone-deep">Joined Nov 2026</p>
        </div>
      </section>
      <div className="mt-8">
        <Tabs
          label="Your rentals"
          tabs={[
            {
              id: "upcoming",
              label: `Upcoming (${upcoming.length})`,
              content: upcoming.length ? (
                <ul className="border-t border-line">
                  {upcoming.map((o) => (
                    <OrderRow key={o.id} o={o} todayISO={todayISO} />
                  ))}
                </ul>
              ) : (
                empty("No upcoming rentals. Textbooks start at $9 a week.")
              ),
            },
            {
              id: "past",
              label: `Past (${past.length})`,
              content: past.length ? (
                <ul className="border-t border-line">
                  {past.map((o) => (
                    <OrderRow key={o.id} o={o} todayISO={todayISO} />
                  ))}
                </ul>
              ) : (
                empty("Nothing returned yet.")
              ),
            },
            {
              id: "listings",
              label: "Listings (0)",
              content: (
                <div>
                  <p className="max-w-md">You haven&apos;t listed anything. Your skis are in storage 50 weeks a year.</p>
                  <ButtonLink href="/list-your-gear" className="mt-6">
                    List your gear
                  </ButtonLink>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Container>
  );
}

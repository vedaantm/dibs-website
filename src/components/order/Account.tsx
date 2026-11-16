"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { lineDatesText } from "@/components/bag/LineDates";
import { ItemImage } from "@/components/product/ItemImage";
import { useMyVerification } from "@/components/trust/useMyLevel";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { VerifyPanel } from "@/components/trust/VerifyPanel";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";
import { getItem, getPickupSpot } from "@/lib/catalog";
import { toISODate, today } from "@/lib/dates";
import { formatCentsExact } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { STATUS_LABEL, orderStatus, windowLabel, type Order } from "@/lib/order";
import { reviewableOrders } from "@/lib/trust";
import { LEVEL_DESCRIPTION, trustedGap } from "@/lib/verification";
import { useOrders } from "@/store/orders";
import { useProfile, useReviews } from "@/store/trust";
import { ConditionCheck } from "./ConditionCheck";
import { HandoffCode } from "./HandoffCode";

function OrderRow({ o, todayISO }: { o: Order; todayISO: string }) {
  const [show, setShow] = useState(false);
  const [check, setCheck] = useState(false);
  const status = orderStatus(o, todayISO);
  const reviews = useReviews((s) => s.reviews);
  const toReview = o.lines.filter((l, i, ls) => ls.findIndex((x) => x.slug === l.slug) === i && reviewableOrders(l.slug, [o], reviews, todayISO).length > 0);
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
            <Tag tone={status === "cancelled" ? "vermilion" : status === "returned" ? "ink" : "navy"}>{STATUS_LABEL[status]}</Tag>
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
            {o.cancelledAt ? ` · Refunded ${formatCentsExact(o.refundCents ?? o.totals.dueTodayCents)}` : ""}
          </p>
          {toReview.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {toReview.map((l) => (
                <li key={l.slug}>
                  <Link href={`/item/${l.slug}#reviews`} className="underline underline-offset-4 hover:no-underline">
                    Review {getItem(l.slug)!.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <button
            type="button"
            onClick={() => setCheck((s) => !s)}
            aria-expanded={check}
            className="label underline underline-offset-4 hover:no-underline"
          >
            {check ? "Hide condition check" : "Condition check"}
          </button>
          {status !== "returned" && status !== "cancelled" && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-expanded={show}
              className="label underline underline-offset-4 hover:no-underline"
            >
              {show ? "Hide handoff code" : "Show handoff code"}
            </button>
          )}
        </div>
      </div>
      {check && (
        <div className="mt-6">
          <ConditionCheck order={o} />
        </div>
      )}
      {show && (
        <div className="mt-6">
          <HandoffCode orderId={o.id} code={o.handoffCode} size="sm" />
        </div>
      )}
    </li>
  );
}

function VerificationSteps() {
  const { level, facts } = useMyVerification();
  const steps = [
    { label: "Email verified", done: facts.emailVerified, text: LEVEL_DESCRIPTION.email },
    { label: "ID verified", done: facts.idVerified, text: LEVEL_DESCRIPTION.id },
    { label: "Trusted lender", done: level === "trusted", text: LEVEL_DESCRIPTION.trusted },
  ];
  const gaps = trustedGap(facts);
  return (
    <section aria-labelledby="verif-title" className="border-b border-line py-6">
      <h2 id="verif-title" className="label">
        Verification
      </h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-3 md:gap-6">
        {steps.map((st, i) => (
          <li key={st.label} className={clsx("border-t pt-3", st.done ? "border-navy" : "border-line")}>
            <p className="flex items-baseline justify-between gap-2">
              <span className="label">
                <span className="tabular-nums text-stone-deep">{String(i + 1).padStart(2, "0")} </span>
                {st.label}
              </span>
              <span className={clsx("text-[12px]", st.done ? "text-navy" : "text-stone-deep")}>{st.done ? "Done" : "To do"}</span>
            </p>
            <p className="mt-1 text-stone-deep">{st.text}</p>
          </li>
        ))}
      </ol>
      {!facts.idVerified && (
        <div className="mt-6 max-w-md">
          <VerifyPanel needId />
        </div>
      )}
      {facts.idVerified && gaps.length > 0 && (
        <p className="mt-4 text-stone-deep">To become a trusted lender: {gaps.join(", ").toLowerCase()}.</p>
      )}
    </section>
  );
}

export function Account() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const listings = useProfile((s) => s.listings);
  const { level, email: verifiedEmail } = useMyVerification();
  if (!hydrated) return <Container className="h-[60svh]" aria-busy="true" />;

  const todayISO = toISODate(today());
  const isPast = (o: Order) => ["returned", "cancelled"].includes(orderStatus(o, todayISO));
  const upcoming = orders.filter((o) => !isPast(o));
  const past = orders.filter(isPast);
  const latest = orders[0];
  const email = verifiedEmail ?? undefined;
  const name = latest?.name || (email ? email.split("@")[0] : "Guest");
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
          <p className="flex flex-wrap items-center gap-2">
            <span className="label">{name}</span>
            <VerificationBadge level={level} />
          </p>
          <p className="mt-1 text-stone-deep">{email ?? "Verify your NYU email to rent or list."}</p>
          <p className="text-stone-deep">Joined Nov 2026</p>
        </div>
      </section>
      <VerificationSteps />
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
              label: `Listings (${listings.length})`,
              content: listings.length ? (
                <div>
                  <ul className="border-t border-line">
                    {listings.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-4">
                        <span className="min-w-0">
                          <span className="label">{l.name}</span>
                          <span className="text-stone-deep">
                            {" "}
                            · {l.brand} · {l.condition} · {l.photoCount} photos
                          </span>
                        </span>
                        <Tag tone="navy">In review · within 24h</Tag>
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href="/list-your-gear" variant="outline" className="mt-6">
                    List another
                  </ButtonLink>
                </div>
              ) : (
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

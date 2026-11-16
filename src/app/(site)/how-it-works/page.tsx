import type { Metadata } from "next";
import Link from "next/link";
import { Faq, StepList } from "@/components/content/Faq";
import { PickupPoints } from "@/components/home/PickupPoints";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CAMPUS } from "@/data/campus";
import { LATE_FEE_POLICY } from "@/lib/fees";

export const metadata: Metadata = {
  title: "How Dibs works",
  description: "Renting, lending, deposits and damage on Dibs, the student rental marketplace at NYU.",
};

const RENTING = [
  { title: "Browse", text: "Textbooks by the week, tuxes by the weekend, cameras by the day. Every listing shows the lender, real renter reviews and a condition photo." },
  { title: "Pick dates", text: "The calendar prices the cheapest combination for you: a weekend rate for Fri–Sun, a week rate past five days, whole weeks for textbooks." },
  { title: "Verify once", text: `Use your @${CAMPUS.emailDomain} email and a six-digit code. Everyone on Dibs is a verified ${CAMPUS.name} student.` },
  { title: "Pay into the hold", text: "You pay the rental and tax. Dibs keeps it. The lender isn't paid until you scan the handoff code at pickup." },
  { title: "Meet on campus", text: `Pick a one-hour window at Bobst, Kimmel, Palladium or your dorm lobby, ${CAMPUS.handoffHours}. Both of you snap photos.` },
  { title: "Return it", text: "Same spot, by 10pm on the return date. Photos again. The deposit hold drops off within 48 hours." },
];

const LENDING = [
  { title: "List it", text: "A photo, a few specs and your rates. We suggest 3–5% of retail per day. Listing is free and unlimited." },
  { title: "Get requests", text: "You see who's asking: name, school, year, their reviews. Accept or decline within 2 hours." },
  { title: "Hand off", text: "Scan the renter's code at pickup. That starts the photo check-in and releases your payment." },
  { title: "Get paid", text: "Payout lands two days after pickup, minus the Dibs fee: 5%, 8% or 10% depending on the item's value. Your first rental is fee-free." },
];

const DAMAGE = [
  { title: "Photo check-in", text: "At pickup, both of you photograph the item in the app. Those photos are the record of its condition." },
  { title: "Return", text: "At return, you both photograph it again, at the same spot." },
  { title: "48h release", text: "If the photos match, the deposit hold is released within 48 hours. Most holds drop the same day." },
  { title: "Dispute", text: "If something's damaged, Dibs compares the two photo sets. If you both confirm, the cost comes from the deposit. If you don't agree, a person at Dibs reviews it within 2 days." },
];

const FAQ = [
  { q: "Do I need a membership?", a: "No. There is no membership. Joining is free, renters pay only when they rent, and lenders pay a small fee only when a rental completes." },
  { q: "What's the deposit, and when is it charged?", a: "Items worth $100 or more carry a deposit. It's an authorization on your card, not a charge. It's released within 48 hours of a clean return. Items under $100 have no deposit." },
  { q: "What if the item isn't as pictured?", a: "Don't scan the handoff code. Your payment is still held by Dibs, so you get it back in full, and the listing is flagged for review." },
  { q: "What if I'm late returning?", a: `${LATE_FEE_POLICY} Message the lender in the app first; most will move the window if you ask early.` },
  { q: "Who can use Dibs?", a: `Verified ${CAMPUS.name} students only, during the pilot. You verify with your @${CAMPUS.emailDomain} email at checkout.` },
  { q: "Are the clothes and costumes clean?", a: "Formal and costume listings must be cleaned before each rental, and lenders confirm it when they list. If you'd rather not rent anything you wear, textbooks and gear are most of the catalog." },
  { q: "Can I get something today?", a: "Handoffs are scheduled, usually within a few days. Nobody we surveyed needed items the same day, so that's what we built for." },
  { q: "What if I can't find what I need?", a: "Post a request. We ping lenders on campus who have one. Browsing is faster, but requests fill most gaps within a day or two." },
];

export default function HowItWorksPage() {
  return (
    <>
      <Container className="pb-12 pt-12 md:pb-16 md:pt-20">
        <Eyebrow>How Dibs works</Eyebrow>
        <h1 className="mt-3 max-w-4xl text-[32px] font-medium uppercase leading-[1.02] tracking-[-0.01em] md:text-[56px]">
          Rent from the person down the hall. Dibs holds the money until you meet.
        </h1>
      </Container>

      <Container as="section" aria-labelledby="renting" className="pb-16 md:pb-24">
        <h2 id="renting" className="section-title mb-8">
          Renting
        </h2>
        <StepList steps={RENTING} />
      </Container>

      <Container as="section" aria-labelledby="lending" className="pb-16 md:pb-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="lending" className="section-title">
            Lending
          </h2>
          <ButtonLink href="/list-your-gear" variant="outline" size="sm">
            List an item
          </ButtonLink>
        </div>
        <StepList steps={LENDING} />
      </Container>

      <Container as="section" id="deposits" aria-labelledby="deposits-title" className="scroll-mt-32 pb-16 md:pb-24">
        <h2 id="deposits-title" className="section-title mb-3">
          Deposits &amp; damage
        </h2>
        <p className="mb-8 max-w-2xl text-stone-deep">Step by step, from pickup to the deposit coming back.</p>
        <StepList steps={DAMAGE} />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div id="late-returns" className="scroll-mt-32 border-t border-ink pt-4">
            <h3 className="label">Late returns</h3>
            <p className="mt-2 max-w-md">{LATE_FEE_POLICY} On a $24-a-day snowboard that&apos;s $36 a day.</p>
          </div>
          <div id="verification" className="scroll-mt-32 border-t border-ink pt-4">
            <h3 className="label">Verification</h3>
            <p className="mt-2 max-w-md">
              Every renter and lender verifies an @{CAMPUS.emailDomain} email with a one-time code, plus a photo of their student ID.
              The ID photo is checked once and never shown to the other person.{" "}
              <Link href="/standards#verification" className="underline underline-offset-4 hover:no-underline">
                Verification levels
              </Link>
            </p>
          </div>
        </div>
      </Container>

      <Container className="pb-16 md:pb-24">
        <Faq items={FAQ} />
      </Container>

      <PickupPoints />
    </>
  );
}

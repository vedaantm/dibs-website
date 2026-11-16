import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CAMPUS } from "@/data/campus";
import { CONDITION_SCALE, MAX_PHOTOS, MIN_PHOTOS } from "@/lib/listing";
import { NOTE_MAX } from "@/lib/handoff";
import { REPORT_REASONS, UNDER_REVIEW_AT } from "@/lib/trust";
import { ID_REQUIRED_RETAIL, LEVEL_DESCRIPTION, TRUSTED_MIN_RATING, TRUSTED_MIN_RENTALS } from "@/lib/verification";

export const metadata: Metadata = {
  title: "Dibs standards",
  description: "How Dibs verifies students, grades condition, checks listings and handles the photo check at every handoff.",
};

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 border-t border-ink py-10 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 md:py-14">
      <h2 id={`${id}-title`} className="section-title mb-6 md:mb-0">
        <span className="block text-[13px] tabular-nums tracking-[0.02em] text-stone-deep">{n}</span>
        {title}
      </h2>
      <div className="flex max-w-2xl flex-col gap-5">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: { term: ReactNode; text: ReactNode }[] }) {
  return (
    <dl className="border-t border-line">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-6">
          <dt>{r.term}</dt>
          <dd className="text-stone-deep">{r.text}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function StandardsPage() {
  return (
    <Container className="pb-24 pt-12 md:pt-20">
      <Eyebrow>Standards</Eyebrow>
      <h1 className="mb-12 mt-3 max-w-4xl text-[32px] font-medium uppercase leading-[1.02] tracking-[-0.01em] md:mb-16 md:text-[56px]">
        What we check, and when.
      </h1>

      <Section id="verification" n="01" title="Verification">
        <p>Everyone on Dibs is a {CAMPUS.name} student. Each profile carries one of three levels, shown on lender cards, product pages and My Dibs.</p>
        <Rows
          rows={[
            { term: <VerificationBadge level="email" />, text: LEVEL_DESCRIPTION.email },
            { term: <VerificationBadge level="id" />, text: "A photo of your student ID, checked once by a person at Dibs and never shown to the other side." },
            {
              term: <VerificationBadge level="trusted" />,
              text: `ID verified, at least ${TRUSTED_MIN_RENTALS} completed rentals as a lender, and a lender rating of ${TRUSTED_MIN_RATING} or higher. Drop below and the badge goes back to ID verified.`,
            },
          ]}
        />
        <p>Anything worth ${ID_REQUIRED_RETAIL} or more retail can only be listed by an ID-verified lender.</p>
      </Section>

      <Section id="condition" n="02" title="Condition scale">
        <p>Three grades, nothing else. If it&apos;s worse than Good or doesn&apos;t fully work, it doesn&apos;t go on Dibs.</p>
        <Rows rows={CONDITION_SCALE.map((c) => ({ term: <span className="label">{c.label}</span>, text: c.guide }))} />
      </Section>

      <Section id="listing" n="03" title="Listing rules">
        <ul className="flex flex-col gap-3">
          <li>— {MIN_PHOTOS} to {MAX_PHOTOS} photos, one of them a close-up of any wear or damage.</li>
          <li>— A condition from the scale above.</li>
          <li>— Formal and costumes: cleaned before each rental, confirmed by the lender.</li>
          <li>— Electronics: tested and fully working, with a list of what&apos;s included.</li>
          <li>— Items worth ${ID_REQUIRED_RETAIL}+ need an ID-verified lender.</li>
        </ul>
        <p className="text-stone-deep">
          The listing form won&apos;t submit until every rule is met. Listings are reviewed within 24 hours during the pilot.{" "}
          <Link href="/list-your-gear" className="text-ink underline underline-offset-4 hover:no-underline">
            List your gear
          </Link>
        </p>
      </Section>

      <Section id="handoff" n="04" title="Handoff check">
        <Rows
          rows={[
            { term: <span className="label">At pickup</span>, text: "Renter and lender each take a condition photo and confirm: Matches the listing, or Doesn't match with a short note." },
            { term: <span className="label">Doesn&apos;t match</span>, text: "At pickup, the rental is cancelled and the renter is refunded in full. The deposit hold is released and the listing goes to review." },
            { term: <span className="label">At return</span>, text: "Same again, at the same spot. If both sides confirm, the deposit hold drops off within 48 hours." },
            { term: <span className="label">Disputes</span>, text: "A Doesn't match at return keeps the deposit on hold while a person at Dibs compares both photo sets, within 2 days." },
          ]}
        />
        <p className="text-stone-deep">Notes are capped at {NOTE_MAX} characters. Both photo sets sit side by side on each order in My Dibs.</p>
      </Section>

      <Section id="reviews" n="05" title="Reviews and reports">
        <p>Only renters who completed a rental can review it: a 1–5 rating and a few lines.</p>
        <p>
          Anyone can report a listing from its product page: {REPORT_REASONS.map((r) => r.label.toLowerCase()).join(", ")}. A listing with {UNDER_REVIEW_AT} or more open
          reports shows Under review and can&apos;t be booked until Dibs checks it.
        </p>
      </Section>
    </Container>
  );
}

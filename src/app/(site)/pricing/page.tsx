import type { Metadata } from "next";
import { Faq } from "@/components/content/Faq";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CAMPUS } from "@/data/campus";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free to join. Renters pay only when they rent. Lenders pay 5–10% on completed rentals, first rental free.",
};

const TIERS = [
  { range: "Under $200 retail", rate: "5%", eg: "TI-84, tent, steamer" },
  { range: "$200–499 retail", rate: "8%", eg: "Textbooks, suits, cooler" },
  { range: "$500+ retail", rate: "10%", eg: "Skis, camera, tuxedo, parka" },
];

const PAYS_FOR = [
  { t: "Payment held until handoff", d: "Your money sits with Dibs until the code is scanned. No Venmo-and-pray." },
  { t: ".edu verification", d: "Every account is a verified student with a code and an ID photo." },
  { t: "Photo check-in", d: "Both sides photograph the item at pickup and return. That's the record." },
  { t: "Damage protection", d: "Deposits on $100+ items cover damage beyond normal wear." },
  { t: "Dispute review", d: "When the photos don't settle it, a person reviews it within 2 days." },
];

const FAQ = [
  { q: "Is there a membership or subscription?", a: "No. We tested one and 8 of 12 students said no. Joining is free and stays free." },
  { q: "Do renters pay a booking fee?", a: `No. Renters pay the rental price plus ${(CAMPUS.salesTaxRate * 100).toFixed(3)}% NYC sales tax. That's it.` },
  { q: "Why does the lender fee change with the item?", a: "Valuable items cost more to protect. A $1,695 parka needs more deposit handling and dispute risk than a $40 toga, so the fee scales: 5%, 8% or 10% of the rental." },
  { q: "Is the first rental really free?", a: "Yes. A lender's first completed rental has no fee, whatever the item." },
  { q: "When is the deposit taken?", a: "It isn't taken, it's held: an authorization on your card that's released within 48 hours of a clean return. No deposit on items under $100." },
  { q: "When do lenders get paid?", a: "Two days after pickup, once the handoff code is scanned. The fee is taken out of that payout." },
];

export default function PricingPage() {
  return (
    <>
      <section className="on-dark bg-dusk grain text-paper">
        <Container className="relative z-[2] py-20 md:py-28">
          <Eyebrow tone="paper">Pricing</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-[36px] font-medium uppercase leading-[1] tracking-[-0.01em] md:text-[64px]">
            Free to join. Pay when you rent.
          </h1>
          <p className="mt-5 max-w-lg text-paper/85">No membership. Renters pay the rental. Lenders pay a small fee only when a rental completes.</p>
        </Container>
      </section>

      <Container as="section" aria-label="Renters and lenders" className="grid gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <div>
          <h2 className="section-title">Renters</h2>
          <dl className="mt-8 border-t border-ink">
            <div className="flex justify-between gap-4 border-b border-line py-4">
              <dt>Rental price</dt>
              <dd className="tabular-nums">Set by the lender</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line py-4">
              <dt>Sales tax</dt>
              <dd className="tabular-nums">{(CAMPUS.salesTaxRate * 100).toFixed(3)}%</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line py-4">
              <dt>Dibs fee</dt>
              <dd className="tabular-nums">$0</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line py-4">
              <dt>Deposit</dt>
              <dd className="text-right">Hold only, on $100+ items</dd>
            </div>
          </dl>
          <p className="mt-4 text-stone-deep">Example: Campbell Biology for a semester is $55 + $4.88 tax. $60 deposit held, not charged.</p>
        </div>
        <div>
          <h2 className="section-title">Lenders</h2>
          <table className="mt-8 w-full border-t border-ink text-left">
            <caption className="sr-only">Lender fee by retail value</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Retail value</th>
                <th scope="col">Fee</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.range} className="border-b border-line">
                  <th scope="row" className="py-4 pr-4 font-normal">
                    {t.range}
                    <span className="block text-[12px] text-stone-deep">{t.eg}</span>
                  </th>
                  <td className="py-4 text-right text-[22px] font-medium tabular-nums">{t.rate}</td>
                </tr>
              ))}
              <tr className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-normal">
                  Your first rental
                </th>
                <td className="label py-4 text-right">Free</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-stone-deep">Taken from the payout, only when a rental completes. Listing is free and unlimited.</p>
        </div>
      </Container>

      <section aria-labelledby="pays-for" className="border-y border-line">
        <Container className="py-16 md:py-24">
          <h2 id="pays-for" className="section-title mb-8">
            What the fee pays for
          </h2>
          <ul className="grid gap-x-6 border-t border-line sm:grid-cols-2 lg:grid-cols-5">
            {PAYS_FOR.map((p) => (
              <li key={p.t} className="border-b border-line py-5 lg:border-b-0 lg:pr-4">
                <p className="label">{p.t}</p>
                <p className="mt-2 text-stone-deep">{p.d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-12 max-w-3xl text-[22px] font-medium leading-snug md:text-[28px]">
            Marketplace is free. Dibs charges lenders a small fee so neither side carries the risk.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/shop">Start renting</ButtonLink>
            <ButtonLink href="/list-your-gear" variant="outline">
              List your gear
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <Faq items={FAQ} />
      </Container>
    </>
  );
}

import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const PERKS = ["Verified .edu network", "Payment held until handoff", "Free on-campus handoff", "List unlimited items, free"];

/** Full-bleed dusk band: our own survey numbers on the left, the no-membership panel on the right. */
export function PricingBand() {
  return (
    <section aria-labelledby="pricing-band-title" className="on-dark bg-dusk grain text-paper">
      <div className="relative z-[2] mx-auto grid max-w-[1600px] gap-12 px-4 py-16 md:grid-cols-2 md:gap-16 md:px-6 md:py-24">
        <div className="flex flex-col justify-between gap-8">
          <Eyebrow tone="paper">What students told us</Eyebrow>
          <div>
            <p id="pricing-band-title" className="max-w-xl text-[30px] font-medium uppercase leading-[1.05] tracking-[-0.01em] md:text-[44px]">
              11 of 12 students we surveyed would rent their textbooks.
            </p>
            <p className="mt-5 max-w-md text-paper/85">
              7 of 12 buy things they&apos;ll only use once. Survey of 12 NYU students, Oct–Nov 2026.
            </p>
          </div>
        </div>
        <div className="border border-paper/40 p-6 md:p-8">
          <p className="label">No membership</p>
          <p className="mt-3 text-[24px] font-medium leading-tight md:text-[28px]">Free to join. Pay when you rent.</p>
          <p className="mt-2 text-paper/85">Lenders pay 5–10% only when a rental completes.</p>
          <ul className="mt-6 border-t border-paper/25">
            {PERKS.map((p) => (
              <li key={p} className="border-b border-paper/25 py-3">
                {p}
              </li>
            ))}
          </ul>
          <ButtonLink href="/pricing" variant="outline-paper" className="mt-8">
            See pricing
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

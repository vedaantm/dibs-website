import { ItemImage } from "@/components/product/ItemImage";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getItem } from "@/lib/catalog";

export const HOW_STEPS = [
  {
    n: "01",
    title: "Browse",
    text: "Textbooks by the week, tuxes by the weekend, cameras by the day.",
    item: "stewart-calculus-9e",
  },
  {
    n: "02",
    title: "Call dibs",
    text: "Pick your dates. Dibs holds your payment until the handoff, so nobody gets scammed.",
    item: "suitsupply-lazio-tuxedo",
  },
  {
    n: "03",
    title: "Meet on campus",
    text: "Hand off at Bobst, Kimmel or your dorm lobby. Photo check-in on both ends.",
    item: "canon-eos-r50-kit",
  },
];

/** Editorial table-of-contents rows on chalk. Not an icon grid. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="bg-chalk py-16 md:py-24">
      <Container>
        <h2 id="how-title" className="section-title mb-8 md:mb-12">
          How it works
        </h2>
        <ol className="border-t border-line">
          {HOW_STEPS.map((s) => {
            const item = getItem(s.item)!;
            return (
              <Reveal
                as="li"
                key={s.n}
                className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 border-b border-line py-6 md:grid-cols-[160px_220px_1fr_120px] md:items-center md:gap-x-8 md:py-8 lg:grid-cols-[200px_280px_1fr_140px]"
              >
                <span aria-hidden className="row-span-2 text-[56px] font-light leading-none tabular-nums text-stone md:row-span-1 md:text-[96px]">
                  {s.n}
                </span>
                <h3 className="text-[18px] font-medium uppercase tracking-[0.01em] md:text-[22px]">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.title}
                </h3>
                <p className="max-w-md text-stone-deep md:text-[15px] md:text-ink">{s.text}</p>
                <div className="hidden w-full md:block">
                  <ItemImage item={item} bare sizes="140px" />
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

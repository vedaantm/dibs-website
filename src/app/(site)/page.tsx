import { CategoryStrip } from "@/components/home/CategoryStrip";
import { Comparison } from "@/components/home/Comparison";
import { EditsCarousel } from "@/components/home/EditsCarousel";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ListYourGear } from "@/components/home/ListYourGear";
import { PickupPoints } from "@/components/home/PickupPoints";
import { PricingBand } from "@/components/home/PricingBand";
import { SectionHead } from "@/components/home/SectionHead";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getEditItems, getEdits, getNewest, lowestRate } from "@/lib/catalog";
import { formatRate } from "@/lib/format";

export default function HomePage() {
  const edits = getEdits().map((e) => {
    const items = getEditItems(e.slug);
    const cheapest = items.map(lowestRate).sort((a, b) => a.amount - b.amount)[0];
    return { ...e, count: items.length, from: formatRate(cheapest.amount, cheapest.unit) };
  });

  return (
    <>
      <Hero />
      <CategoryStrip />

      <section aria-labelledby="just-listed" className="pb-16 md:pb-24">
        <Container>
          <SectionHead id="just-listed" title="Just listed" href="/shop?sort=newest" linkLabel="Shop all" />
          <ProductGrid items={getNewest(8)} />
        </Container>
      </section>

      <HowItWorks />

      <section id="edits" aria-labelledby="edits-title" className="py-16 md:py-24">
        <Container>
          <h2 id="edits-title" className="section-title -mb-10 max-w-[70%]">
            Top picks
          </h2>
          <EditsCarousel edits={edits} />
        </Container>
      </section>

      <PricingBand />
      <Comparison />
      <ListYourGear />
      <PickupPoints />
    </>
  );
}

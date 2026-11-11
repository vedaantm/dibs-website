import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/item/Gallery";
import { ItemAccordions, LenderCard, Reviews, TrustRow } from "@/components/item/ItemDetails";
import { ItemHeader } from "@/components/item/ItemHeader";
import { ItemRentalProvider } from "@/components/item/ItemRentalContext";
import { MobileBar } from "@/components/item/MobileBar";
import { RentalPanel } from "@/components/item/RentalPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { ITEMS } from "@/data/items";
import { getItem, getLender, getLenderItems, getRelated, lowestRate } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ITEMS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/item/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return { title: "Listing not found" };
  const rate = lowestRate(item);
  return {
    title: `${item.brand} ${item.name}`,
    description: `Rent the ${item.brand} ${item.name} from $${rate.amount} / ${rate.unit} at NYU. ${item.description}`.slice(0, 300),
  };
}

function jsonLd(slug: string) {
  const item = getItem(slug)!;
  const rate = lowestRate(item);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${item.brand} ${item.name}`,
    brand: { "@type": "Brand", name: item.brand },
    description: item.description,
    category: item.subcategory,
    url: `${SITE.url}/item/${item.slug}`,
    offers: {
      "@type": "Offer",
      price: rate.amount,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      description: `Rental, per ${rate.unit}`,
    },
  };
  if (item.reviews.length) {
    data.review = item.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    }));
  }
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ItemPage({ params }: PageProps<"/item/[slug]">) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();
  const lender = getLender(item.lenderId)!;
  const related = getRelated(item, 4);
  const more = getLenderItems(lender.id, item.slug).slice(0, 4);

  return (
    <ItemRentalProvider slug={item.slug}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(item.slug) }} />
      <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-6 lg:pt-6">
        <div className="min-w-0">
          <Gallery item={item} />
        </div>
        <div className="min-w-0 lg:sticky lg:top-[var(--header-h)] lg:self-start">
          <div className="flex flex-col gap-7 px-4 pb-10 pt-6 md:px-6 lg:px-12 lg:pb-16 lg:pt-6">
            <ItemHeader item={item} />
            <div className="h-px bg-line" />
            <RentalPanel />
            <TrustRow item={item} />
            <LenderCard lender={lender} />
            <Reviews item={item} />
            <ItemAccordions item={item} />
          </div>
        </div>
      </div>

      <Container as="section" aria-labelledby="also-like" className="border-t border-line pb-16 pt-12 md:pb-24 md:pt-16">
        <h2 id="also-like" className="section-title mb-8 md:mb-10">
          You may also like
        </h2>
        <ProductGrid items={related} />
      </Container>
      {more.length > 0 && (
        <Container as="section" aria-labelledby="more-from" className="pb-20 md:pb-28">
          <h2 id="more-from" className="section-title mb-8 md:mb-10">
            More from {lender.firstName}
          </h2>
          <ProductGrid items={more} />
        </Container>
      )}
      <MobileBar />
    </ItemRentalProvider>
  );
}

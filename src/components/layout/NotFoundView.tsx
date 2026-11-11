import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getNewest } from "@/lib/catalog";

/** House-style 404: "This listing got dibs'd." + 4 items. */
export function NotFoundView({ title = "This listing got dibs'd.", note }: { title?: string; note?: string }) {
  return (
    <>
      <Container className="py-16 md:py-24">
        <Eyebrow>404 · Not found</Eyebrow>
        <h1 className="section-title mt-3 max-w-3xl">{title}</h1>
        <p className="mt-4 max-w-md text-stone-deep">
          {note ?? "Someone got there first, or the link is old. Plenty more on the shelf."}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/shop">Shop all</ButtonLink>
          <ButtonLink href="/request" variant="outline">
            Request an item
          </ButtonLink>
        </div>
      </Container>
      <Container className="pb-20 md:pb-28">
        <h2 className="label mb-6 border-t border-line pt-8">Just listed</h2>
        <ProductGrid items={getNewest(4)} />
      </Container>
    </>
  );
}

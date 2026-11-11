"use client";

import { useEffect } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getNewest } from "@/lib/catalog";

export default function SiteError({ error, retry }: { error: unknown; retry?: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <>
      <Container className="py-16 md:py-24">
        <Eyebrow>Something broke</Eyebrow>
        <h1 className="section-title mt-3 max-w-3xl">This page got dibs&apos;d by a bug.</h1>
        <p className="mt-4 max-w-md text-stone-deep">Your bag is safe. Try again, or keep browsing.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          {retry && <Button onClick={() => retry()}>Try again</Button>}
          <ButtonLink href="/shop" variant="outline">
            Shop all
          </ButtonLink>
        </div>
      </Container>
      <Container className="pb-20">
        <h2 className="label mb-6 border-t border-line pt-8">Just listed</h2>
        <ProductGrid items={getNewest(4)} />
      </Container>
    </>
  );
}

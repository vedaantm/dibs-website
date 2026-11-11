"use client";

import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import type { Item } from "@/data/types";
import { getItem } from "@/lib/catalog";
import { useHydrated } from "@/lib/hooks";
import { useWishlist } from "@/store/wishlist";

export function WishlistGrid() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  if (!hydrated) return <div className="h-64" aria-hidden />;
  const items = slugs.map(getItem).filter((i): i is Item => Boolean(i));
  if (items.length === 0) {
    return (
      <div className="py-6">
        <p className="max-w-md">Nothing saved yet. Tap the heart on anything you&apos;ll need this semester.</p>
        <ButtonLink href="/shop" variant="outline" className="mt-6">
          Shop all
        </ButtonLink>
      </div>
    );
  }
  return (
    <>
      <p className="label mb-8 tabular-nums">
        {items.length} saved
      </p>
      <ProductGrid items={items} />
    </>
  );
}

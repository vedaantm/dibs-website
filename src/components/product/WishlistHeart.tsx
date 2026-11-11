"use client";

import clsx from "clsx";
import { Heart } from "lucide-react";
import { useHydrated } from "@/lib/hooks";
import { useWishlist } from "@/store/wishlist";

/** Heart toggle for cards and the product page. Renders unfilled until hydrated. */
export function WishlistHeart({
  slug,
  name,
  className,
  onImage,
}: {
  slug: string;
  name: string;
  className?: string;
  /** Small paper square so the heart reads on dark image tiles. */
  onImage?: boolean;
}) {
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.slugs.includes(slug)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={clsx(
        "inline-flex items-center justify-center text-ink transition-opacity duration-200 hover:opacity-70",
        onImage ? "size-8 bg-paper/85" : "size-10",
        className,
      )}
    >
      <Heart size={20} strokeWidth={1.25} aria-hidden className={clsx("transition-colors duration-200", saved && "fill-current")} />
    </button>
  );
}

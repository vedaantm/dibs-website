"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { CATEGORIES } from "@/data/categories";
import type { Item } from "@/data/types";
import { gradientIsDark, hasImage, tileClass } from "@/lib/images";

type Props = {
  item: Pick<Item, "slug" | "name" | "brand" | "categorySlug" | "subcategory" | "images" | "condition">;
  index?: number;
  /** Fade the next image in on hover of the nearest `.group` (250ms). */
  hoverSwap?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Hide the brand/name text on the fallback tile (tiny thumbnails). */
  bare?: boolean;
  /** Override alt text (e.g. "Condition photo"). */
  alt?: string;
};

function altFor(item: Props["item"], index: number) {
  return `${item.brand} ${item.name}${index > 0 ? `, photo ${index + 1}` : ""}`;
}

/** One 2:3 photo on blush. Product shots are multiplied onto blush like Atticus's studio backdrop. */
function Photo({ src, alt, sizes, priority, className }: { src: string; alt: string; sizes: string; priority?: boolean; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("blob:")}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={clsx(
        "object-contain p-[8%] mix-blend-multiply transition-opacity duration-200 ease-house",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}

/** Gradient tile used when a photo is missing. Category gradient + grain, brand and name bottom-left. */
export function FallbackTile({
  item,
  index = 0,
  bare,
  className,
}: {
  item: Props["item"];
  index?: number;
  bare?: boolean;
  className?: string;
}) {
  const cat = CATEGORIES.find((c) => c.slug === item.categorySlug);
  const g = cat?.gradient ?? "chalk";
  const dark = gradientIsDark[g];
  return (
    <div
      role="img"
      aria-label={altFor(item, index)}
      className={clsx(
        "grain absolute inset-0 flex flex-col justify-end overflow-hidden",
        tileClass[g],
        dark ? "text-paper" : "text-ink",
        bare ? "p-2" : "p-[8%]",
        className,
      )}
    >
      {!bare && (
        <div className="relative z-[2] flex min-w-0 flex-col gap-1.5">
          <span className="eyebrow truncate opacity-80">{index > 0 ? `${item.subcategory} · ${item.condition}` : item.brand}</span>
          <span className="line-clamp-4 max-w-[16ch] text-[12px] font-medium uppercase leading-[1.15] tracking-[0.01em] hyphens-auto break-words sm:text-[16px] lg:text-[18px]">
            {item.name}
          </span>
        </div>
      )}
    </div>
  );
}

export function ItemImage({
  item,
  index = 0,
  hoverSwap = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  priority,
  className,
  bare,
  alt,
}: Props) {
  const src = item.images[index];
  const next = item.images[index + 1];
  // blob: URLs are local previews from the listing form (never uploaded)
  const usable = (p: string | undefined): p is string => Boolean(p) && (p!.startsWith("blob:") || hasImage(p));
  const hasMain = usable(src);
  const hasNext = hoverSwap && usable(next);
  // Without photos, the hover swap shows the tile's second face (subcategory · condition).
  const fallbackSwap = hoverSwap && !hasMain && !hasNext && Boolean(next) && !bare;

  return (
    <div className={clsx("relative aspect-[2/3] w-full overflow-hidden bg-blush", className)}>
      {hasMain ? (
        <Photo src={src} alt={alt ?? altFor(item, index)} sizes={sizes} priority={priority} />
      ) : (
        <FallbackTile item={item} index={index} bare={bare} />
      )}
      {hasNext && (
        <div className="absolute inset-0 bg-blush opacity-0 transition-opacity duration-250 ease-house group-hover:opacity-100">
          <Photo src={next} alt={altFor(item, index + 1)} sizes={sizes} />
        </div>
      )}
      {fallbackSwap && (
        <div aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-250 ease-house group-hover:opacity-100">
          <FallbackTile item={item} index={index + 1} />
        </div>
      )}
    </div>
  );
}

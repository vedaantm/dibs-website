import clsx from "clsx";
import Link from "next/link";
import { CAMPUS } from "@/data/campus";
import type { Item } from "@/data/types";
import { getPickupSpot, isJustListed, lowestRate } from "@/lib/catalog";
import { formatRate } from "@/lib/format";
import { Tag } from "@/components/ui/Tag";
import { ItemImage } from "./ItemImage";
import { QuickDibsTrigger } from "./QuickDibsTrigger";
import { WishlistHeart } from "./WishlistHeart";

type Props = {
  item: Item;
  sizes?: string;
  priority?: boolean;
  /** Hide the hover QUICK DIBS bar (e.g. listing preview). */
  noQuick?: boolean;
  /** Render without links (listing preview). */
  preview?: boolean;
  className?: string;
};

export function cardTag(item: Item): string | null {
  if (isJustListed(item, CAMPUS.catalogDate)) return "Just listed";
  if (item.tags.includes("weekend rate") && item.rates.weekend) return "Weekend rate";
  return null;
}

/**
 * Atticus-style card: 2:3 image on blush, uppercase name truncated left with the
 * lowest rate right-aligned on the same line; brand · condition · pickup spot below.
 */
export function ProductCard({ item, sizes, priority, noQuick, preview, className }: Props) {
  const rate = lowestRate(item);
  const spot = getPickupSpot(item.pickupSpotIds[0]);
  const tag = cardTag(item);
  const href = `/item/${item.slug}`;

  const body = (
    <>
      <p className="mt-3 flex items-baseline justify-between gap-3">
        <span className="label min-w-0 truncate">{item.name}</span>
        <span className="label shrink-0 tabular-nums">{formatRate(rate.amount, rate.unit)}</span>
      </p>
      <p className="mt-0.5 truncate text-stone-deep">
        {item.brand} · {item.condition}
        {spot ? ` · ${spot.shortName}` : ""}
      </p>
    </>
  );

  return (
    <article className={clsx("group relative min-w-0", className)}>
      <div className="relative">
        {preview ? (
          <ItemImage item={item} hoverSwap sizes={sizes} priority={priority} />
        ) : (
          <Link href={href} tabIndex={-1} aria-hidden="true">
            <ItemImage item={item} hoverSwap sizes={sizes} priority={priority} />
          </Link>
        )}
        {tag && (
          <span className="pointer-events-none absolute left-2 top-2 z-[3] md:left-3 md:top-3">
            <Tag className="bg-paper/90">{tag}</Tag>
          </span>
        )}
        {!preview && (
          <WishlistHeart slug={item.slug} name={item.name} onImage className="absolute right-2 top-2 z-[3] md:right-3 md:top-3" />
        )}
        {!noQuick && !preview && <QuickDibsTrigger slug={item.slug} name={item.name} />}
      </div>
      {preview ? (
        body
      ) : (
        <Link href={href} className="block focus-visible:outline-offset-4">
          {body}
        </Link>
      )}
    </article>
  );
}

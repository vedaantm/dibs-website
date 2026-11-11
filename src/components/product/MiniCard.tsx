import Link from "next/link";
import type { Item } from "@/data/types";
import { lowestRate } from "@/lib/catalog";
import { formatRate } from "@/lib/format";
import { ItemImage } from "./ItemImage";

/** Compact card for overlays and empty states: image, uppercase name, lowest rate. */
export function MiniCard({ item, onNavigate }: { item: Item; onNavigate?: () => void }) {
  const rate = lowestRate(item);
  return (
    <Link href={`/item/${item.slug}`} onClick={onNavigate} className="group block min-w-0">
      <ItemImage item={item} hoverSwap sizes="(min-width: 768px) 12vw, 25vw" />
      <p className="label mt-2 truncate">{item.name}</p>
      <p className="tabular-nums text-[12px] uppercase text-stone-deep">{formatRate(rate.amount, rate.unit)}</p>
    </Link>
  );
}

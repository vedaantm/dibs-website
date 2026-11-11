import clsx from "clsx";
import type { Item } from "@/data/types";
import { ProductCard } from "./ProductCard";

/** 2 cols mobile / 3 tablet / 4 desktop; gap-x 24px (16 on mobile), gap-y 48px. */
export function ProductGrid({ items, className, priorityCount = 0 }: { items: Item[]; className?: string; priorityCount?: number }) {
  return (
    <ul className={clsx("grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4", className)}>
      {items.map((item, i) => (
        <li key={item.slug} className="min-w-0">
          <ProductCard item={item} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

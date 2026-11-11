import Link from "next/link";
import { Fragment } from "react";
import { Tag } from "@/components/ui/Tag";
import type { Item } from "@/data/types";
import { getCategory } from "@/lib/catalog";
import { formatDollars, type RateUnit } from "@/lib/format";

const UNITS: RateUnit[] = ["day", "weekend", "week", "semester"];

export function rateLine(item: Pick<Item, "rates">): string {
  return UNITS.filter((u) => item.rates[u] !== undefined)
    .map((u) => `${formatDollars(item.rates[u]!)} / ${u}`)
    .join(" · ");
}

/** Breadcrumb · brand · name · rate line with struck retail · condition/size tags. */
export function ItemHeader({ item, linkCrumbs = true }: { item: Item; linkCrumbs?: boolean }) {
  const cat = getCategory(item.categorySlug);
  const crumbs = [
    { href: "/shop", label: "Shop" },
    { href: `/shop/${item.categorySlug}`, label: cat?.shortName ?? item.categorySlug },
    { href: `/shop/${item.categorySlug}?sub=${encodeURIComponent(item.subcategory)}`, label: item.subcategory },
  ];
  return (
    <div>
      <nav aria-label="Breadcrumb">
        <ol className="eyebrow flex flex-wrap gap-1.5 text-stone-deep">
          {crumbs.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && <li aria-hidden>/</li>}
              <li>
                {linkCrumbs ? (
                  <Link href={c.href} className="hover:text-ink hover:underline hover:underline-offset-4">
                    {c.label}
                  </Link>
                ) : (
                  c.label
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      <p className="eyebrow mt-5 text-stone-deep">{item.brand}</p>
      <h1 className="mt-1.5 text-[20px] font-medium uppercase leading-tight tracking-[0.01em] md:text-[22px]">{item.name}</h1>
      <p className="mt-3 uppercase tabular-nums">
        {rateLine(item)}
        <span className="ml-3 whitespace-nowrap normal-case text-stone-deep">
          <span className="sr-only">Retail value </span>
          <s aria-hidden>Retail {formatDollars(item.retailValue)}</s>
        </span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>{item.condition}</Tag>
        {item.size && <Tag>Size {item.size}</Tag>}
        {item.cleanedBetweenRentals && <Tag tone="navy">Cleaned between rentals</Tag>}
        {item.deposit === 0 && <Tag>No deposit</Tag>}
      </div>
    </div>
  );
}

import clsx from "clsx";
import Image from "next/image";
import type { Item } from "@/data/types";
import type { GradientName } from "@/data/types";
import { gradientClass, hasImage } from "@/lib/images";

export type RowEntry = { key: string; label: string; count: number; gradient: GradientName; items: Item[] };

/** Small 2:3 thumbnails with uppercase labels; clicking filters; the active one is underlined. */
export function SubRow({
  entries,
  active,
  onPick,
  label,
}: {
  entries: RowEntry[];
  active: string[];
  onPick?: (key: string) => void;
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="no-scrollbar -mx-4 flex scroll-px-4 snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:gap-4 md:px-0">
        {entries.map((e) => {
          const photo = e.items.map((i) => i.images[0]).find(hasImage);
          const isActive = active.includes(e.key);
          return (
            <li key={e.key} className="w-[88px] shrink-0 snap-start md:w-[120px]">
              <button
                type="button"
                onClick={() => onPick?.(e.key)}
                aria-pressed={isActive}
                disabled={!onPick}
                className="group block w-full text-left disabled:cursor-default"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-blush">
                  {photo ? (
                    <Image src={photo} alt="" fill sizes="120px" className="object-contain p-[8%] mix-blend-multiply" />
                  ) : (
                    <div aria-hidden className={clsx(gradientClass[e.gradient], "grain absolute inset-0")} />
                  )}
                </div>
                <span
                  className={clsx(
                    "label mt-2 block truncate text-[11px] md:text-[12px]",
                    isActive ? "underline decoration-1 underline-offset-4" : "group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4",
                  )}
                >
                  {e.label} <span className="font-normal tabular-nums text-stone-deep">{e.count}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

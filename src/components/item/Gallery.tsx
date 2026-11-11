"use client";

import { useRef, useState } from "react";
import { ItemImage } from "@/components/product/ItemImage";
import type { Item } from "@/data/types";

function ConditionLabel() {
  return (
    <span className="eyebrow pointer-events-none absolute bottom-3 left-3 z-[3] bg-paper/90 px-2 py-1 text-ink">
      Condition photo · taken at listing
    </span>
  );
}

/**
 * Desktop: images stacked full-width (2:3, blush). Mobile: horizontal swipe gallery
 * with a thin progress bar instead of dots. The last image is the condition photo.
 */
export function Gallery({ item }: { item: Item }) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const n = item.images.length;

  return (
    <>
      {/* mobile swipe */}
      <div className="lg:hidden">
        <div
          ref={track}
          onScroll={() => {
            const el = track.current;
            if (!el) return;
            const max = el.scrollWidth - el.clientWidth;
            setProgress(max > 0 ? el.scrollLeft / max : 0);
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`${item.name} photos, swipe for more`}
          role="region"
          tabIndex={0}
        >
          {item.images.map((_, i) => (
            <div key={i} className="relative w-full shrink-0 snap-center">
              <ItemImage item={item} index={i} sizes="100vw" priority={i === 0} />
              {i === n - 1 && <ConditionLabel />}
            </div>
          ))}
        </div>
        <div aria-hidden className="relative mx-4 mt-3 h-px bg-line">
          <div
            className="absolute inset-y-0 left-0 h-px bg-ink transition-[left] duration-200"
            style={{ width: `${100 / n}%`, left: `${progress * (100 - 100 / n)}%` }}
          />
        </div>
      </div>

      {/* desktop stack */}
      <div className="hidden flex-col gap-1 lg:flex">
        {item.images.map((_, i) => (
          <div key={i} className="relative">
            <ItemImage item={item} index={i} sizes="60vw" priority={i === 0} />
            {i === n - 1 && <ConditionLabel />}
          </div>
        ))}
      </div>
    </>
  );
}

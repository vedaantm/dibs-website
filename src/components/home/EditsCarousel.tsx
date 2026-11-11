"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Edit } from "@/data/types";
import { tileClass, gradientIsDark, hasImage } from "@/lib/images";

type Props = { edits: (Edit & { count: number; from: string })[] };

/** Horizontal carousel of edits: arrows, drag on desktop, swipe on mobile, snap. */
export function EditsCarousel({ edits }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label="Previous edit"
          aria-controls="edits-track"
          className="inline-flex size-10 items-center justify-center border border-line transition-opacity duration-200 hover:border-ink disabled:opacity-35 disabled:hover:border-line"
        >
          <ArrowLeft size={18} strokeWidth={1.25} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label="Next edit"
          aria-controls="edits-track"
          className="inline-flex size-10 items-center justify-center border border-line transition-opacity duration-200 hover:border-ink disabled:opacity-35 disabled:hover:border-line"
        >
          <ArrowRight size={18} strokeWidth={1.25} aria-hidden />
        </button>
      </div>
      <ul
        ref={track}
        id="edits-track"
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = track.current;
          if (!d || !el) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4 && !d.moved) {
            d.moved = true;
            el.setPointerCapture(e.pointerId);
            el.style.scrollSnapType = "none";
          }
          if (d.moved) el.scrollLeft = d.left - dx;
        }}
        onPointerUp={(e) => {
          const el = track.current;
          if (el) {
            el.style.scrollSnapType = "";
            if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
          }
          // swallow the click that ends a drag
          if (drag.current?.moved) {
            const stop = (ev: Event) => {
              ev.preventDefault();
              ev.stopPropagation();
            };
            window.addEventListener("click", stop, { capture: true, once: true });
          }
          drag.current = null;
        }}
        className="no-scrollbar -mx-4 flex scroll-px-4 cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-4 active:cursor-grabbing md:mx-0 md:scroll-px-0 md:gap-6 md:px-0"
      >
        {edits.map((e) => {
          const dark = gradientIsDark[e.gradient];
          const photo = `/edits/${e.slug}.jpg`;
          return (
            <li key={e.slug} className="w-[82vw] max-w-[520px] shrink-0 snap-start md:w-[42%] lg:w-[31%]">
              <Link href={`/shop?edit=${e.slug}`} className="group block" draggable={false}>
                <div
                  className={clsx(
                    "relative flex aspect-[4/5] flex-col justify-between overflow-hidden p-5 md:p-6",
                    tileClass[e.gradient],
                    "grain",
                    dark ? "on-dark text-paper" : "text-ink",
                  )}
                >
                  {hasImage(photo) && (
                    <Image src={photo} alt="" fill sizes="(min-width: 1024px) 31vw, 82vw" className="object-cover" draggable={false} />
                  )}
                  <span className="eyebrow relative z-[2]">
                    {e.count} items · from {e.from}
                  </span>
                  <span
                    aria-hidden
                    className="relative z-[2] text-[44px] font-light uppercase leading-[0.95] tracking-[-0.02em] transition-transform duration-300 ease-house group-hover:translate-x-1 md:text-[56px]"
                  >
                    {e.title}
                  </span>
                </div>
                <h3 className="label mt-4">{e.title}</h3>
                <p className="mt-1 max-w-sm text-stone-deep">{e.blurb}</p>
                <span className="label mt-3 inline-block underline underline-offset-4 group-hover:no-underline">Shop now</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

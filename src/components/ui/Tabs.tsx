"use client";

import clsx from "clsx";
import { useId, useRef, useState, type ReactNode } from "react";

/** ARIA tabs with roving focus (arrow keys, Home/End). Hairline underline on the active tab. */
export function Tabs({ tabs, label }: { tabs: { id: string; label: string; content: ReactNode }[]; label: string }) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focus = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-6 border-b border-line">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") focus(i + 1);
              else if (e.key === "ArrowLeft") focus(i - 1);
              else if (e.key === "Home") focus(0);
              else if (e.key === "End") focus(tabs.length - 1);
            }}
            className={clsx(
              "label -mb-px h-12 border-b transition-colors duration-200",
              active === i ? "border-ink text-ink" : "border-transparent text-stone-deep hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={active !== i}
          tabIndex={0}
          className="pt-8 focus-visible:outline-offset-4"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

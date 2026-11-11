"use client";

import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

type ItemProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/** One hairline-separated accordion row with a + / – icon and animated height. */
export function AccordionItem({ title, children, defaultOpen = false, className }: ItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={clsx("border-b border-line", className)}>
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="label flex w-full items-center justify-between py-4 text-left"
        >
          <span>{title}</span>
          {open ? (
            <Minus size={16} strokeWidth={1.25} aria-hidden />
          ) : (
            <Plus size={16} strokeWidth={1.25} aria-hidden />
          )}
        </button>
      </h3>
      {/* grid-rows trick animates height without measuring */}
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={clsx(
          "grid transition-[grid-template-rows] duration-250 ease-house",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pr-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("border-t border-line", className)}>{children}</div>;
}

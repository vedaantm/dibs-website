"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useRef, type ReactNode, type RefObject } from "react";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";

type Side = "left" | "right" | "top" | "bottom" | "center";

type Props = {
  open: boolean;
  onClose: () => void;
  side: Side;
  label: string;
  children: ReactNode;
  /** Panel size/extra classes, e.g. "w-full md:w-[480px]". */
  className?: string;
  /** The bag drawer is the only place a soft shadow is allowed. */
  shadow?: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  /** z-index layer; nested sheets sit higher. */
  layer?: "z-50" | "z-[60]" | "z-[70]";
  id?: string;
};

const closedTransform: Record<Side, string> = {
  left: "-translate-x-full",
  right: "translate-x-full",
  top: "-translate-y-full",
  bottom: "translate-y-full",
  center: "translate-y-3 opacity-0",
};

const position: Record<Side, string> = {
  left: "inset-y-0 left-0 h-full",
  right: "inset-y-0 right-0 h-full",
  top: "inset-x-0 top-0 max-h-svh",
  bottom: "inset-x-0 bottom-0 max-h-[90svh]",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85svh] w-[min(560px,calc(100vw-32px))]",
};

/**
 * Accessible slide-in panel: scrim, focus trap, Esc to close, scroll lock,
 * returns focus on close. Stays mounted so open/close animate (250ms house ease).
 */
export function Sheet({
  open,
  onClose,
  side,
  label,
  children,
  className,
  shadow,
  initialFocus,
  layer = "z-50",
  id,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose, initialFocus);
  useScrollLock(open);

  return (
    <div
      className={clsx("fixed inset-0", layer, open ? "visible" : "pointer-events-none invisible")}
      style={{ transition: open ? "visibility 0s" : "visibility 0s linear 260ms" }}
      inert={!open}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-ink/40 transition-opacity duration-250 ease-house",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={clsx(
          "absolute flex flex-col overflow-hidden bg-paper outline-none transition-[transform,opacity] duration-250 ease-house",
          position[side],
          side === "center" ? (open ? "opacity-100" : "opacity-0") : open ? "translate-x-0 translate-y-0" : closedTransform[side],
          shadow && "shadow-[0_0_40px_rgba(22,19,15,0.18)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Standard sheet header: uppercase title + close button, hairline under. */
export function SheetHeader({ title, onClose, className }: { title: ReactNode; onClose: () => void; className?: string }) {
  return (
    <div className={clsx("flex h-16 shrink-0 items-center justify-between border-b border-line px-4 md:px-6", className)}>
      <h2 className="label">{title}</h2>
      <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 inline-flex size-10 items-center justify-center hover:opacity-70">
        <X size={20} strokeWidth={1.25} aria-hidden />
      </button>
    </div>
  );
}

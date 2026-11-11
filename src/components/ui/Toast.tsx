"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect } from "react";

/** Small ink toast, bottom-center. Announced politely. */
export function Toast({ message, onClose, ms = 8000 }: { message: string | null; onClose: () => void; ms?: number }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, ms);
    return () => clearTimeout(t);
  }, [message, ms, onClose]);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      {message && (
        <div className={clsx("on-dark animate-fade-in pointer-events-auto flex items-center gap-4 bg-ink px-5 py-3 text-paper")}>
          <span className="label">{message}</span>
          <button type="button" onClick={onClose} aria-label="Dismiss" className="inline-flex size-6 items-center justify-center opacity-80 hover:opacity-100">
            <X size={14} strokeWidth={1.25} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

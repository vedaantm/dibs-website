"use client";

import { useState } from "react";
import { RentalDatePicker } from "@/components/rental/RentalDatePicker";
import { selectionOf, type BagLine } from "@/lib/bag";
import { getItem } from "@/lib/catalog";
import type { Selection } from "@/lib/pricing";
import { useBag } from "@/store/bag";

/** Inline picker that re-quotes a bag line as soon as a valid range is chosen. */
export function EditDates({ line, onDone }: { line: BagLine; onDone?: () => void }) {
  const item = getItem(line.slug)!;
  const updateDates = useBag((s) => s.updateDates);
  const [sel, setSel] = useState<Selection | null>(() => (line.issue ? null : selectionOf(line)));
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 border border-line bg-paper p-3">
      <RentalDatePicker
        item={item}
        value={sel}
        compact
        idPrefix={`edit-${line.id}`}
        onChange={(s, q) => {
          setSel(s);
          setError(null);
          if (s && q?.ok) {
            const r = updateDates(line.id, s);
            if (!r.ok) setError(r.error);
          }
        }}
      />
      {error && (
        <p role="alert" className="text-vermilion-deep">
          {error}
        </p>
      )}
      {onDone && (
        <button type="button" onClick={onDone} className="label self-end underline underline-offset-4 hover:no-underline">
          Done
        </button>
      )}
    </div>
  );
}

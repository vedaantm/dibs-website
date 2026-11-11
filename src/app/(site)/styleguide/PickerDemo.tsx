"use client";

import { useState } from "react";
import { RentalDatePicker } from "@/components/rental/RentalDatePicker";
import { getItem } from "@/lib/catalog";
import type { Selection } from "@/lib/pricing";

export function PickerDemo({ slug }: { slug: string }) {
  const item = getItem(slug)!;
  const [sel, setSel] = useState<Selection | null>(null);
  return (
    <div>
      <p className="label mb-3">{item.name}</p>
      <RentalDatePicker item={item} value={sel} onChange={(s) => setSel(s)} idPrefix={`sg-${slug}`} />
    </div>
  );
}

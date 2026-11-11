"use client";

import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { useUI } from "@/store/ui";

/** Slide-in bag from the right. Filled out in Phase 2.4. */
export function BagDrawer() {
  const open = useUI((s) => s.bagOpen);
  const setBag = useUI((s) => s.setBag);
  const close = () => setBag(false);
  return (
    <Sheet open={open} onClose={close} side="right" label="Bag" shadow className="w-full md:w-[440px]">
      <SheetHeader title="Bag (0)" onClose={close} />
      <div className="p-6">
        <p>Your bag is empty.</p>
      </div>
    </Sheet>
  );
}

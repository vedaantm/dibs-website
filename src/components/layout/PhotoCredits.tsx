"use client";

import { useState } from "react";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { imageCredits } from "@/lib/images";

/** Footer link that opens a small modal listing Unsplash photographers from credits.json. */
export function PhotoCredits() {
  const [open, setOpen] = useState(false);
  const credits = Object.entries(imageCredits());
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="underline-offset-4 hover:underline" aria-haspopup="dialog">
        Photo credits
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="center" label="Photo credits" layer="z-[60]">
        <SheetHeader title="Photo credits" onClose={() => setOpen(false)} />
        <div className="overflow-y-auto px-4 py-6 text-ink md:px-6">
          {credits.length === 0 ? (
            <p>
              No stock photos in use. Listings without a photo show a colour tile until the lender uploads their own.
            </p>
          ) : (
            <>
              <p className="mb-4 text-stone-deep">Product photos via Unsplash. Lenders&apos; own photos replace these as they upload.</p>
              <ul className="divide-y divide-line border-y border-line">
                {credits.map(([path, c]) => (
                  <li key={path} className="flex items-baseline justify-between gap-4 py-2">
                    <span className="truncate text-stone-deep">{path.replace("/items/", "").replace(/\/\d\.jpg$/, "")}</span>
                    <a href={c.profile} target="_blank" rel="noreferrer" className="shrink-0 underline underline-offset-4">
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Sheet>
    </>
  );
}

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Item, PickupSpotId } from "@/data/types";
import { getItem } from "@/lib/catalog";
import type { Quote, Selection } from "@/lib/pricing";
import { useBag } from "@/store/bag";
import { useUI } from "@/store/ui";

type Ctx = {
  item: Item;
  sel: Selection | null;
  quote: Quote | null;
  spot: PickupSpotId;
  error: string | null;
  setSelection: (sel: Selection | null, quote: Quote | null) => void;
  setSpot: (s: PickupSpotId) => void;
  callDibs: () => boolean;
};

const ItemRental = createContext<Ctx | null>(null);

/** Shares the chosen dates, quote and pickup spot between the desktop panel and the mobile bar. */
export function ItemRentalProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const item = getItem(slug)!;
  const [sel, setSel] = useState<Selection | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [spot, setSpot] = useState<PickupSpotId>(item.pickupSpotIds[0]);
  const [error, setError] = useState<string | null>(null);
  const add = useBag((s) => s.add);
  const openBag = useUI((s) => s.openBag);
  const pulseBag = useUI((s) => s.pulseBag);

  const value: Ctx = {
    item,
    sel,
    quote,
    spot,
    error,
    setSelection: (s, q) => {
      setSel(s);
      setQuote(q);
      setError(null);
    },
    setSpot,
    callDibs: () => {
      if (!sel || !quote?.ok) return false;
      const r = add(item.slug, sel, spot);
      if (!r.ok) {
        setError(r.error);
        return false;
      }
      setError(null);
      pulseBag();
      openBag();
      return true;
    },
  };
  return <ItemRental.Provider value={value}>{children}</ItemRental.Provider>;
}

export function useItemRental(): Ctx {
  const c = useContext(ItemRental);
  if (!c) throw new Error("useItemRental outside provider");
  return c;
}

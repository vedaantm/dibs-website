"use client";

import { Button } from "@/components/ui/Button";
import { Radio } from "@/components/ui/Field";
import { RentalDatePicker } from "@/components/rental/RentalDatePicker";
import { useHydrated } from "@/lib/hooks";
import { getPickupSpot } from "@/lib/catalog";
import { formatCents } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";
import { useItemRental } from "./ItemRentalContext";

export function PickupChoice({ idPrefix = "pickup" }: { idPrefix?: string }) {
  const { item, spot, setSpot } = useItemRental();
  return (
    <fieldset>
      <legend className="label mb-3">Pickup</legend>
      <div className="flex flex-col gap-3">
        {item.pickupSpotIds.map((id) => {
          const s = getPickupSpot(id)!;
          return (
            <Radio
              key={id}
              id={`${idPrefix}-${id}`}
              name={`${idPrefix}-spot`}
              value={id}
              checked={spot === id}
              onChange={() => setSpot(id)}
              label={s.name}
              description={s.address}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

export function CallDibsButton({ onDone }: { onDone?: () => void }) {
  const { quote, callDibs } = useItemRental();
  const ready = Boolean(quote?.ok);
  return (
    <Button
      full
      disabled={!ready}
      onClick={() => {
        if (callDibs()) onDone?.();
      }}
    >
      {ready ? `Call dibs — ${formatCents(quote!.subtotal)}` : "Select dates"}
    </Button>
  );
}

export function AddError() {
  const { error } = useItemRental();
  if (!error) return null;
  return (
    <p role="alert" className="text-vermilion-deep">
      {error}
    </p>
  );
}

function WishlistText() {
  const { item } = useItemRental();
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.slugs.includes(item.slug)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  return (
    <Button variant="text" onClick={() => toggle(item.slug)} aria-pressed={saved} className="self-center">
      {saved ? "Saved to wishlist" : "Add to wishlist"}
    </Button>
  );
}

/** Desktop rental controls (the mobile bar opens the same picker in a bottom sheet). */
export function RentalPanel() {
  const { item, sel, setSelection } = useItemRental();
  return (
    <div className="flex flex-col gap-6">
      <div className="hidden flex-col gap-6 lg:flex">
        <RentalDatePicker item={item} value={sel} onChange={setSelection} idPrefix="panel" />
        <PickupChoice idPrefix="panel-pickup" />
        <div className="flex flex-col gap-3">
          <CallDibsButton />
          <AddError />
          <WishlistText />
        </div>
      </div>
      <div className="lg:hidden">
        <WishlistText />
      </div>
    </div>
  );
}

import { ItemImage } from "@/components/product/ItemImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Hairline } from "@/components/ui/Hairline";
import { getItem } from "@/lib/catalog";
import { hasImage } from "@/lib/images";
import { PickerDemo } from "./PickerDemo";

const EXAMPLES = ["campbell-biology-12e", "burton-ripcord-154", "canon-eos-r50-kit", "disco-sequin-jumpsuit"];

/** Primitives added after 1.1: ItemImage (and later ProductCard / date picker). */
export function StyleguideExtras() {
  const items = EXAMPLES.map((s) => getItem(s)!);
  return (
    <>
      <Hairline />
      <section className="py-12">
        <Eyebrow className="mb-2">ItemImage · 2:3 on blush</Eyebrow>
        <p className="mb-6 max-w-2xl text-stone-deep">
          With a photo: object-contain, 8% padding, multiplied onto blush. Without one: the category gradient with
          grain, brand and name bottom-left. Hover the tiles to see the second face fade in (250ms).
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {items.map((item) => (
            <figure key={item.slug} className="group">
              <ItemImage item={item} hoverSwap />
              <figcaption className="eyebrow mt-2 text-stone-deep">
                {item.categorySlug} · {hasImage(item.images[0]) ? "photo" : "fallback tile"}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <Hairline />
      <section className="py-12">
        <Eyebrow className="mb-2">RentalDatePicker · live quote</Eyebrow>
        <p className="mb-6 max-w-2xl text-stone-deep">
          Blocked dates are struck through. Presets jump to the next free slot. Textbooks bill in whole weeks.
        </p>
        <div className="grid gap-12 lg:grid-cols-2">
          <PickerDemo slug="burton-ripcord-154" />
          <PickerDemo slug="campbell-biology-12e" />
        </div>
      </section>
    </>
  );
}

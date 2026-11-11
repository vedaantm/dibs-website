"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ItemHeader } from "@/components/item/ItemHeader";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { CAMPUS, PICKUP_SPOTS } from "@/data/campus";
import { CATEGORIES } from "@/data/categories";
import type { CategorySlug, Condition, Item, PickupSpotId, Rates } from "@/data/types";
import { DEPOSIT_THRESHOLD } from "@/data/items";
import { feeRateForRetail } from "@/lib/fees";
import { formatCents, formatDollars } from "@/lib/format";
import { CONDITIONS } from "@/lib/filters";

type RateKey = keyof Rates;
const RATE_KEYS: { key: RateKey; label: string; days: number }[] = [
  { key: "day", label: "Per day", days: 1 },
  { key: "weekend", label: "Per weekend", days: 2.2 },
  { key: "week", label: "Per week", days: 4.5 },
  { key: "semester", label: "Per semester", days: 20 },
];

/** Suggested per-day range: 3–5% of retail. Other periods scale from the 4% midpoint. */
export function suggestRates(retail: number): { low: number; high: number; rates: Record<RateKey, number> } {
  const low = Math.max(1, Math.round(retail * 0.03));
  const high = Math.max(low, Math.round(retail * 0.05));
  const mid = retail * 0.04;
  const r = Object.fromEntries(RATE_KEYS.map((k) => [k.key, Math.max(1, Math.round(mid * k.days))])) as Record<RateKey, number>;
  return { low, high, rates: r };
}

const STEPS = ["Item", "Photos", "Rates", "Pickup"];

export function ListingForm() {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<CategorySlug>("textbooks");
  const [sub, setSub] = useState(CATEGORIES[0].subcategories[0]);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [condition, setCondition] = useState<Condition>("Excellent");
  const [retail, setRetail] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [rates, setRates] = useState<Partial<Record<RateKey, string>>>({});
  const [spots, setSpots] = useState<PickupSpotId[]>(["bobst"]);
  const [cleaned, setCleaned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);

  // revoke every preview URL once, on unmount (removed photos are revoked as they go)
  const created = useRef<string[]>([]);
  useEffect(() => () => created.current.forEach((p) => URL.revokeObjectURL(p)), []);

  const category = CATEGORIES.find((c) => c.slug === cat)!;
  const needsClean = cat === "formal" || cat === "costumes";
  const retailN = Number(retail) || 0;
  const suggestion = suggestRates(retailN);
  const feeRate = feeRateForRetail(retailN);
  const rateNums: Rates = Object.fromEntries(
    Object.entries(rates)
      .filter(([, v]) => v && Number(v) > 0)
      .map(([k, v]) => [k, Number(v)]),
  );
  const headline = rateNums.weekend ?? rateNums.week ?? rateNums.day ?? rateNums.semester;
  const headlineUnit = rateNums.weekend ? "weekend" : rateNums.week ? "week" : rateNums.day ? "day" : "semester";

  const item: Item = {
    slug: "preview",
    name: name || "Your item",
    brand: brand || "Your brand",
    categorySlug: cat,
    subcategory: sub,
    retailValue: retailN,
    rates: Object.keys(rateNums).length ? rateNums : { day: suggestion.rates.day },
    deposit: retailN < DEPOSIT_THRESHOLD ? 0 : Math.round(retailN * 0.3),
    condition,
    size: size || undefined,
    description,
    whatsIncluded: [],
    specs: [],
    lenderId: "maya-k",
    pickupSpotIds: spots.length ? spots : ["bobst"],
    images: photos.length ? photos : ["/items/preview/1.jpg", "/items/preview/2.jpg"],
    imageQuery: "",
    listedAt: CAMPUS.catalogDate,
    blockedDates: [],
    tags: [],
    cleanedBetweenRentals: needsClean || undefined,
    reviews: [],
  };

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!name.trim()) e.name = "Name the item.";
      if (!brand.trim()) e.brand = "Brand, or \"Lender's own\".";
      if (!(retailN > 0)) e.retail = "Roughly what it costs new.";
    }
    if (s === 2 && Object.keys(rateNums).length === 0) e.rates = "Set at least one rate.";
    if (s === 3) {
      if (spots.length === 0) e.spots = "Pick at least one spot.";
      if (needsClean && !cleaned) e.cleaned = "Required for formal and costumes.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < 3) setStep(step + 1);
    else setPreview(true);
  };

  if (preview) {
    return (
      <div>
        <p className="eyebrow mb-6 border-y border-line py-2 text-ink">Listing preview</p>
        <div className="grid gap-10 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-12">
          <ProductCard item={item} preview />
          <div className="max-w-lg">
            <ItemHeader item={item} linkCrumbs={false} />
            {description && <p className="mt-6">{description}</p>}
            <p className="mt-6 border-t border-line pt-4 text-stone-deep">Listings go live after a quick review during the pilot.</p>
            <p className="mt-1 text-[12px] text-stone-deep">Pilot preview: nothing was sent anywhere.</p>
            <div className="mt-6 flex gap-4">
              <Button onClick={() => setPreview(false)} variant="outline">
                Edit listing
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-8 grid grid-cols-4 border border-line" aria-label="Listing steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={clsx("label flex h-11 items-center justify-center gap-1.5", i > 0 && "border-l border-line", i === step ? "bg-ink text-paper" : i < step ? "text-ink" : "text-stone-deep")}>
            <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="hidden sm:inline">{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid max-w-xl gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" htmlFor="ls-cat">
              <Select
                id="ls-cat"
                value={cat}
                onChange={(e) => {
                  const c = e.target.value as CategorySlug;
                  setCat(c);
                  setSub(CATEGORIES.find((x) => x.slug === c)!.subcategories[0]);
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subcategory" htmlFor="ls-sub">
              <Select id="ls-sub" value={sub} onChange={(e) => setSub(e.target.value)}>
                {category.subcategories.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Item name" htmlFor="ls-name" error={errors.name}>
            <Input id="ls-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Calculus: Early Transcendentals, 9th Edition" aria-invalid={Boolean(errors.name) || undefined} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" htmlFor="ls-brand" error={errors.brand}>
              <Input id="ls-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Cengage" aria-invalid={Boolean(errors.brand) || undefined} />
            </Field>
            <Field label="Retail value" htmlFor="ls-retail" error={errors.retail} hint="What it costs new">
              <div className="relative">
                <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-deep">
                  $
                </span>
                <Input id="ls-retail" inputMode="numeric" value={retail} onChange={(e) => setRetail(e.target.value.replace(/\D/g, "").slice(0, 5))} className="pl-6 tabular-nums" placeholder="240" aria-invalid={Boolean(errors.retail) || undefined} />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Condition" htmlFor="ls-cond">
              <Select id="ls-cond" value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Size (optional)" htmlFor="ls-size">
              <Input id="ls-size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="40R, US 6, 154cm" />
            </Field>
          </div>
          <Field label="Description" htmlFor="ls-desc" hint="Two or three honest sentences. Wear, quirks, what you used it for.">
            <Textarea id="ls-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-xl">
          <label htmlFor="ls-photos" className="flex min-h-32 cursor-pointer flex-col justify-center border border-dashed border-stone p-5 hover:border-ink">
            <span className="label">Add photos</span>
            <span className="text-[12px] text-stone-deep">Up to 4. Plain wall, daylight, portrait. The last one is your condition photo. Previews stay in this browser.</span>
            <input
              id="ls-photos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
                const urls = files.slice(0, Math.max(0, 4 - photos.length)).map((f) => URL.createObjectURL(f));
                created.current.push(...urls);
                setPhotos((p) => [...p, ...urls]);
                e.target.value = "";
              }}
            />
          </label>
          {photos.length > 0 && (
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <li key={p} className="relative aspect-[2/3] bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={p} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(p);
                      created.current = created.current.filter((x) => x !== p);
                      setPhotos((ps) => ps.filter((x) => x !== p));
                    }}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 inline-flex size-7 items-center justify-center bg-paper/90"
                  >
                    <X size={14} strokeWidth={1.25} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[12px] text-stone-deep">No photos yet? You can preview without them.</p>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl">
          <p className="text-stone-deep">
            {retailN > 0
              ? `Suggested: ${formatDollars(suggestion.low)}–${formatDollars(suggestion.high)} per day (3–5% of ${formatDollars(retailN)} retail).`
              : "Add a retail value in step 1 for suggestions."}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {RATE_KEYS.map((k) => (
              <Field key={k.key} label={k.label} htmlFor={`ls-rate-${k.key}`} hint={retailN > 0 ? `Suggested ${formatDollars(suggestion.rates[k.key])}` : undefined}>
                <div className="relative">
                  <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-deep">
                    $
                  </span>
                  <Input
                    id={`ls-rate-${k.key}`}
                    inputMode="numeric"
                    value={rates[k.key] ?? ""}
                    onChange={(e) => setRates((r) => ({ ...r, [k.key]: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    className="pl-6 tabular-nums"
                    placeholder={retailN > 0 ? String(suggestion.rates[k.key]) : ""}
                  />
                </div>
              </Field>
            ))}
          </div>
          {retailN > 0 && (
            <Button variant="text" className="mt-3" onClick={() => setRates(Object.fromEntries(RATE_KEYS.map((k) => [k.key, String(suggestion.rates[k.key])])))}>
              Use suggested rates
            </Button>
          )}
          {errors.rates && (
            <p role="alert" className="mt-2 text-[12px] text-vermilion-deep">
              {errors.rates}
            </p>
          )}
          <div className="mt-6 border-t border-ink pt-4" aria-live="polite">
            {headline ? (
              <>
                <p className="flex justify-between text-stone-deep">
                  <span>
                    One {headlineUnit} at {formatDollars(headline)}
                  </span>
                  <span className="tabular-nums">{formatCents(headline * 100)}</span>
                </p>
                <p className="flex justify-between text-stone-deep">
                  <span>Dibs fee {Math.round(feeRate * 100)}%</span>
                  <span className="tabular-nums">−{formatCents(Math.round(headline * 100 * feeRate))}</span>
                </p>
                <p className="mt-2 flex items-baseline justify-between">
                  <span className="label">You earn</span>
                  <span className="text-[24px] font-medium tabular-nums">
                    {formatCents(Math.round(headline * 100 * (1 - feeRate)))} / {headlineUnit}
                  </span>
                </p>
                <p className="mt-1 text-[12px] text-stone-deep">Your first rental is fee-free: {formatCents(headline * 100)}.</p>
              </>
            ) : (
              <p className="text-stone-deep">Set a rate to see what you earn.</p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid max-w-xl gap-6">
          <fieldset>
            <legend className="label mb-3">Where can you hand off?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {PICKUP_SPOTS.map((s) => (
                <Checkbox
                  key={s.id}
                  id={`ls-spot-${s.id}`}
                  label={s.name}
                  description={s.address}
                  checked={spots.includes(s.id)}
                  onChange={() => setSpots((xs) => (xs.includes(s.id) ? xs.filter((x) => x !== s.id) : [...xs, s.id]))}
                />
              ))}
            </div>
            {errors.spots && (
              <p role="alert" className="mt-2 text-[12px] text-vermilion-deep">
                {errors.spots}
              </p>
            )}
          </fieldset>
          {needsClean && (
            <div>
              <Checkbox
                id="ls-clean"
                label="Cleaned before each rental"
                description="Required for formal and costumes. Renters see a CLEANED BETWEEN RENTALS tag."
                checked={cleaned}
                aria-invalid={Boolean(errors.cleaned) || undefined}
                onChange={(e) => setCleaned(e.target.checked)}
              />
              {errors.cleaned && (
                <p role="alert" className="mt-2 text-[12px] text-vermilion-deep">
                  {errors.cleaned}
                </p>
              )}
            </div>
          )}
          <p className="text-stone-deep">
            Deposit: {retailN >= DEPOSIT_THRESHOLD ? `about ${formatDollars(Math.round(retailN * 0.3))}, held on the renter's card` : `none, it's under $${DEPOSIT_THRESHOLD}`}.
          </p>
        </div>
      )}

      <div className="mt-10 flex max-w-xl items-center justify-between border-t border-line pt-6">
        {step > 0 ? (
          <Button variant="text" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={next}>{step < 3 ? `Continue to ${STEPS[step + 1].toLowerCase()}` : "Preview listing"}</Button>
      </div>
    </div>
  );
}

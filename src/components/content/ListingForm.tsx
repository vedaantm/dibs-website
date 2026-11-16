"use client";

import clsx from "clsx";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ItemHeader } from "@/components/item/ItemHeader";
import { ProductCard } from "@/components/product/ProductCard";
import { useMyVerification } from "@/components/trust/useMyLevel";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { VerifyPanel } from "@/components/trust/VerifyPanel";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Radio, Select, Textarea } from "@/components/ui/Field";
import { CAMPUS, PICKUP_SPOTS } from "@/data/campus";
import { CATEGORIES } from "@/data/categories";
import type { CategorySlug, Condition, Item, PickupSpotId, Rates } from "@/data/types";
import { DEPOSIT_THRESHOLD } from "@/data/items";
import { feeRateForRetail } from "@/lib/fees";
import { formatCents, formatDollars } from "@/lib/format";
import { CONDITION_SCALE, MAX_PHOTOS, MIN_PHOTOS, isElectronics, listingChecklist, listingReady, needsCleaning, type CheckItem } from "@/lib/listing";
import { ID_REQUIRED_RETAIL } from "@/lib/verification";
import { useProfile } from "@/store/trust";

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

/** Live list of listing standards; ticks off as the form fills in. */
function Checklist({ checks, className }: { checks: CheckItem[]; className?: string }) {
  const met = checks.filter((c) => c.met).length;
  return (
    <section aria-labelledby="ls-checklist" className={clsx("border border-line p-4", className)}>
      <h2 id="ls-checklist" className="label flex justify-between gap-3">
        <span>Listing standards</span>
        <span className="tabular-nums text-stone-deep" aria-live="polite">
          {met} / {checks.length}
        </span>
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {checks.map((c) => (
          <li key={c.id} className={clsx("flex items-start gap-2", c.met ? "text-ink" : "text-stone-deep")}>
            <span aria-hidden className={clsx("mt-px flex size-4 shrink-0 items-center justify-center border", c.met ? "border-ink bg-ink text-paper" : "border-stone")}>
              {c.met && <Check size={12} strokeWidth={2} />}
            </span>
            <span>
              {c.label}
              <span className="sr-only">{c.met ? " (done)" : " (to do)"}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-line pt-3 text-[12px] text-stone-deep">
        Rules in full:{" "}
        <Link href="/standards#listing" className="underline underline-offset-4 hover:text-ink">
          Dibs standards
        </Link>
      </p>
    </section>
  );
}

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
  const [closeUp, setCloseUp] = useState<number | null>(null);
  const [tested, setTested] = useState(false);
  const [included, setIncluded] = useState<string[]>([""]);
  const [submitted, setSubmitted] = useState(false);
  const { level } = useMyVerification();
  const submitListing = useProfile((s) => s.submitListing);
  const [rates, setRates] = useState<Partial<Record<RateKey, string>>>({});
  const [spots, setSpots] = useState<PickupSpotId[]>(["bobst"]);
  const [cleaned, setCleaned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);

  // revoke every preview URL once, on unmount (removed photos are revoked as they go)
  const created = useRef<string[]>([]);
  useEffect(() => () => created.current.forEach((p) => URL.revokeObjectURL(p)), []);

  const category = CATEGORIES.find((c) => c.slug === cat)!;
  const needsClean = needsCleaning(cat);
  const isTech = isElectronics(cat);
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
    whatsIncluded: isTech ? included.filter((l) => l.trim()) : [],
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

  const checks = listingChecklist(
    {
      category: cat,
      name,
      brand,
      retailValue: retailN,
      condition,
      photoCount: photos.length,
      closeUpIndex: closeUp,
      ratesSet: Object.keys(rateNums).length,
      pickupSpots: spots.length,
      cleaned,
      tested,
      included,
    },
    level,
  );
  const ready = listingReady(checks);
  const needsId = retailN >= ID_REQUIRED_RETAIL;

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

  if (submitted) {
    return (
      <div className="max-w-xl" role="status">
        <p className="eyebrow mb-6 border-y border-line py-2 text-ink">Listing submitted</p>
        <h2 className="text-[20px] font-medium uppercase leading-tight">
          {item.brand} {item.name}
        </h2>
        <p className="mt-4">Listings are reviewed within 24 hours during the pilot.</p>
        <p className="mt-1 text-stone-deep">
          We check the photos against the condition you picked. You&apos;ll see it under My Dibs, in Listings.
        </p>
        <p className="mt-1 text-[12px] text-stone-deep">Pilot preview: nothing was sent anywhere.</p>
        <Link href="/account" className="label mt-8 inline-block underline underline-offset-4 hover:no-underline">
          Go to My Dibs
        </Link>
      </div>
    );
  }

  if (preview) {
    return (
      <div>
        <p className="eyebrow mb-6 border-y border-line py-2 text-ink">Listing preview</p>
        <div className="grid gap-10 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-12">
          <ProductCard item={item} preview />
          <div className="max-w-lg">
            <ItemHeader item={item} linkCrumbs={false} />
            {description && <p className="mt-6">{description}</p>}
            <Checklist checks={checks} className="mt-6" />
            {!ready && <p className="mt-3 text-stone-deep">Every standard has to be met before you can submit. Edit the listing to fill the gaps.</p>}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                disabled={!ready}
                onClick={() => {
                  if (!ready) return;
                  submitListing({ name: item.name, brand: item.brand, category: cat, condition, retailValue: retailN, photoCount: photos.length });
                  setSubmitted(true);
                }}
              >
                Submit for review
              </Button>
              <Button onClick={() => setPreview(false)} variant="outline">
                Edit listing
              </Button>
            </div>
            <p className="mt-3 text-[12px] text-stone-deep">Pilot preview: nothing is sent anywhere.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,36rem)_minmax(0,20rem)] lg:justify-between">
      <div className="min-w-0">
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
          <fieldset>
            <legend className="eyebrow mb-3 text-ink">Condition</legend>
            <div className="flex flex-col border-t border-line">
              {CONDITION_SCALE.map((c) => (
                <Radio
                  key={c.value}
                  id={`ls-cond-${c.value.replace(" ", "-").toLowerCase()}`}
                  name="ls-cond"
                  value={c.value}
                  checked={condition === c.value}
                  onChange={() => setCondition(c.value as Condition)}
                  label={<span className="label">{c.label}</span>}
                  description={c.guide}
                  className="border-b border-line py-3"
                />
              ))}
            </div>
            <p className="mt-2 text-[12px] text-stone-deep">Anything below Good, or not fully working, can&apos;t be listed.</p>
          </fieldset>
          <Field label="Size (optional)" htmlFor="ls-size">
            <Input id="ls-size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="40R, US 6, 154cm" />
          </Field>
          {isTech && (
            <fieldset>
              <legend className="eyebrow mb-1.5 text-ink">What&apos;s included</legend>
              <p className="mb-3 text-[12px] text-stone-deep">One line per thing: body, charger, cables, case, memory card.</p>
              <ul className="flex flex-col gap-2">
                {included.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <Input
                      aria-label={`Included item ${i + 1}`}
                      value={line}
                      onChange={(e) => setIncluded((xs) => xs.map((x, j) => (j === i ? e.target.value.slice(0, 80) : x)))}
                      placeholder={i === 0 ? "Camera body" : "Charger + USB-C cable"}
                    />
                    {included.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIncluded((xs) => xs.filter((_, j) => j !== i))}
                        aria-label={`Remove included item ${i + 1}`}
                        className="inline-flex size-12 shrink-0 items-center justify-center border border-line hover:border-ink"
                      >
                        <X size={14} strokeWidth={1.25} aria-hidden />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {included.length < 10 && (
                <Button variant="text" className="mt-3" onClick={() => setIncluded((xs) => [...xs, ""])}>
                  Add a line
                </Button>
              )}
            </fieldset>
          )}
          <Field label="Description" htmlFor="ls-desc" hint="Two or three honest sentences. Wear, quirks, what you used it for.">
            <Textarea id="ls-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-xl">
          <label htmlFor="ls-photos" className="flex min-h-32 cursor-pointer flex-col justify-center border border-dashed border-stone p-5 hover:border-ink">
            <span className="label">Add photos</span>
            <span className="text-[12px] text-stone-deep">
              {MIN_PHOTOS} to {MAX_PHOTOS}. Plain wall, daylight, portrait. One has to be a close-up of any wear or damage. Previews stay in this browser.
            </span>
            <input
              id="ls-photos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
                const urls = files.slice(0, Math.max(0, MAX_PHOTOS - photos.length)).map((f) => URL.createObjectURL(f));
                created.current.push(...urls);
                setPhotos((p) => [...p, ...urls]);
                e.target.value = "";
              }}
            />
          </label>
          {photos.length > 0 && (
            <fieldset className="mt-4">
              <legend className="eyebrow mb-3 text-ink">Mark the close-up of wear or damage</legend>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((p, i) => (
                <li key={p}>
                <div className="relative aspect-[2/3] bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={p} alt={`Photo ${i + 1}${closeUp === i ? ", close-up of wear" : ""}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(p);
                      created.current = created.current.filter((x) => x !== p);
                      setPhotos((ps) => ps.filter((x) => x !== p));
                      setCloseUp((c) => (c === null || c === i ? null : c > i ? c - 1 : c));
                    }}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 inline-flex size-7 items-center justify-center bg-paper/90"
                  >
                    <X size={14} strokeWidth={1.25} aria-hidden />
                  </button>
                </div>
                <Radio
                  id={`ls-closeup-${i}`}
                  name="ls-closeup"
                  checked={closeUp === i}
                  onChange={() => setCloseUp(i)}
                  label={<span className="text-[12px]">Wear close-up</span>}
                  className="mt-2"
                />
                </li>
              ))}
            </ul>
            </fieldset>
          )}
          <p className="mt-3 text-[12px] tabular-nums text-stone-deep">
            {photos.length} of {MIN_PHOTOS} required photos. No wear at all? Close-up the part that gets used most: the spine, the soles, the lens.
          </p>
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
          {isTech && (
            <Checkbox
              id="ls-tested"
              label="Tested and fully working"
              description="Charged it, turned it on, tried every button this week. Required for electronics."
              checked={tested}
              onChange={(e) => setTested(e.target.checked)}
            />
          )}
          <div className="border-t border-line pt-5">
            <p className="label flex flex-wrap items-center gap-2">
              Your verification <VerificationBadge level={level} />
            </p>
            <p className="mt-1 text-stone-deep">
              {needsId ? `Items worth $${ID_REQUIRED_RETAIL}+ need an ID-verified lender.` : "Every lender verifies an @nyu.edu email."}
            </p>
            <div className="mt-4">
              <VerifyPanel needId={needsId} />
            </div>
          </div>
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
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <Checklist checks={checks} />
      </aside>
    </div>
  );
}

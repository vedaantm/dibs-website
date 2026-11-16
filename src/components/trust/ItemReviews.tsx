"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import type { Review } from "@/data/types";
import { fromISODate, toISODate, today } from "@/lib/dates";
import { useHydrated } from "@/lib/hooks";
import { REVIEW_MAX, reviewableOrders, shortName, validateReview } from "@/lib/trust";
import { useOrders } from "@/store/orders";
import { useReviews } from "@/store/trust";

function ReviewForm({ slug, orderId, author }: { slug: string; orderId: string; author: string }) {
  const add = useReviews((s) => s.add);
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-4 border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const v = validateReview(rating, text);
        if (v) return setErr(v);
        add({ slug, orderId, author, rating: rating!, text: text.trim(), date: toISODate(today()) });
      }}
    >
      <p className="label">Review your rental · order {orderId}</p>
      <fieldset>
        <legend className="eyebrow mb-2 text-ink">Rating</legend>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="-ml-px first:ml-0">
              <input type="radio" name={`rate-${slug}`} value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
              <span
                className={clsx(
                  "flex size-10 cursor-pointer items-center justify-center border border-ink tabular-nums transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy",
                  rating === n ? "bg-ink text-paper" : "hover:bg-bone",
                )}
              >
                <span className="sr-only">{n} out of 5</span>
                <span aria-hidden>{n}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Your review" htmlFor={`review-${slug}`} hint="How it was at pickup, how it held up, anything the next renter should know.">
        <Textarea id={`review-${slug}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={REVIEW_MAX} />
      </Field>
      {err && (
        <p role="alert" className="text-[12px] text-vermilion-deep">
          {err}
        </p>
      )}
      <Button type="submit" variant="outline" className="self-start">
        Post review
      </Button>
    </form>
  );
}

/** Seed reviews + reviews written in this browser. Only renters with a completed rental can add one. */
export function ItemReviews({ slug, seed }: { slug: string; seed: Review[] }) {
  const hydrated = useHydrated();
  const local = useReviews((s) => s.reviews);
  const orders = useOrders((s) => s.orders);
  const mine = hydrated ? local.filter((r) => r.slug === slug) : [];
  const all: Review[] = [...mine.map(({ author, rating, date, text }) => ({ author, rating, date, text })), ...seed];
  const open = hydrated ? reviewableOrders(slug, orders, local, toISODate(today()))[0] : undefined;

  return (
    <section aria-labelledby="reviews-title" id="reviews" className="scroll-mt-32">
      <h2 id="reviews-title" className="label mb-2">
        Renter reviews{all.length > 0 && <span className="tabular-nums text-stone-deep"> ({all.length})</span>}
      </h2>
      {all.length === 0 ? (
        <p className="border-t border-line pt-3 text-stone-deep">No reviews yet. Your payment is still held until handoff.</p>
      ) : (
        <ul className="border-t border-line">
          {all.map((r) => (
            <li key={r.author + r.date + r.text.slice(0, 12)} className="border-b border-line py-3">
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="label">{r.author}</span>
                <span className="tabular-nums text-stone-deep">
                  {r.rating} / 5 · {format(fromISODate(r.date), "MMM d, yyyy")}
                </span>
              </p>
              <p className="mt-1">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <div className="mt-4">
          <ReviewForm slug={slug} orderId={open.id} author={shortName(open.name)} />
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-stone-deep">Only renters who&apos;ve completed a rental of this item can review it.</p>
      )}
    </section>
  );
}

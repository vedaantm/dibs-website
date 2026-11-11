"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { MiniCard } from "@/components/product/MiniCard";
import { Container } from "@/components/ui/Container";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { searchItems } from "@/lib/catalog";
import { useDebounced } from "@/lib/hooks";
import { useUI } from "@/store/ui";

export const POPULAR_SEARCHES = ["Calculus", "Biology", "TI-84", "Ski", "Cooler", "Tuxedo"];

/** Full-width panel from the top. Big borderless input, popular searches, live results. */
export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setSearch = useUI((s) => s.setSearch);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query.trim(), 120);
  const results = useMemo(() => (debounced ? searchItems(debounced) : []), [debounced]);
  const close = () => setSearch(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Sheet open={open} onClose={close} side="top" label="Search" initialFocus={inputRef} className="overflow-y-auto">
      <SheetHeader title="Search" onClose={close} className="border-b-0" />
      <Container className="pb-10 pt-2 md:pb-14">
        <form role="search" onSubmit={submit} className="border-b border-ink">
          <label htmlFor="site-search" className="sr-only">
            Search listings
          </label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH TEXTBOOKS, TUXES, SKIS…"
            className="h-16 w-full bg-transparent [&::-webkit-search-cancel-button]:appearance-none text-[22px] font-medium uppercase tracking-[-0.01em] placeholder:text-stone-deep focus:outline-none md:h-20 md:text-[32px]"
          />
        </form>

        {!debounced && (
          <div className="mt-6">
            <p className="eyebrow text-stone-deep">Popular searches</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {POPULAR_SEARCHES.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(p);
                      inputRef.current?.focus();
                    }}
                    className="label underline-offset-4 hover:underline"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {debounced && results.length > 0 && (
          <div className="mt-6">
            <p className="eyebrow text-stone-deep" aria-live="polite">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-4 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6">
              {results.slice(0, 8).map((item) => (
                <li key={item.slug}>
                  <MiniCard item={item} onNavigate={close} />
                </li>
              ))}
            </ul>
            <Link
              href={`/search?q=${encodeURIComponent(debounced)}`}
              onClick={close}
              className="label group mt-8 inline-flex items-center gap-2"
            >
              See all results for ‘{debounced}’
              <ArrowRight size={16} strokeWidth={1.25} aria-hidden className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {debounced && results.length === 0 && (
          <p className="mt-6 max-w-lg" aria-live="polite">
            Nothing yet. Someone on campus probably has one —{" "}
            <Link
              href={`/request?q=${encodeURIComponent(debounced)}`}
              onClick={close}
              className="underline underline-offset-4 hover:no-underline"
            >
              request it
            </Link>
            .
          </p>
        )}
      </Container>
    </Sheet>
  );
}

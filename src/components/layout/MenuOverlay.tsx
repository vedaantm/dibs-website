"use client";

import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PICKUP_SPOTS, CAMPUS } from "@/data/campus";
import { CATEGORIES } from "@/data/categories";
import { Sheet, SheetHeader } from "@/components/ui/Sheet";
import { useReducedMotion } from "@/lib/hooks";
import { useUI } from "@/store/ui";

const bigLink =
  "block py-1.5 text-[24px] font-medium uppercase leading-tight tracking-[-0.01em] transition-opacity duration-200 hover:opacity-60 md:text-[28px]";

export function subcategoryHref(categorySlug: string, sub: string) {
  return `/shop/${categorySlug}?sub=${encodeURIComponent(sub)}`;
}

/** Full-height panel from the left. Big uppercase links, categories expand to subcategories. */
export function MenuOverlay() {
  const open = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(null);
  const close = () => setMenu(false);

  let n = 0;
  const stagger = () => {
    const i = n++;
    return open && !reduced ? { className: "stagger-in", style: { animationDelay: `${60 + i * 30}ms` } } : { className: "", style: {} };
  };

  const top = [
    { href: "/shop", label: "Shop all" },
    { href: "/shop?sort=newest", label: "Just listed" },
  ];
  const after = [
    { href: "/#edits", label: "Edits" },
    { href: "/how-it-works", label: "How Dibs works" },
    { href: "/list-your-gear", label: "List your gear" },
    { href: "/pricing", label: "Pricing" },
    { href: "/request", label: "Request an item" },
  ];

  return (
    <Sheet open={open} onClose={close} side="left" label="Menu" id="site-menu" className="w-full md:w-[480px]">
      <SheetHeader title="Menu" onClose={close} />
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 pb-10 pt-4 md:px-6">
        <ul key={open ? "open" : "closed"}>
          {top.map((l) => {
            const s = stagger();
            return (
              <li key={l.label} className={s.className} style={s.style}>
                <Link href={l.href} className={bigLink} onClick={close}>
                  {l.label}
                </Link>
              </li>
            );
          })}
          {CATEGORIES.map((c) => {
            const s = stagger();
            const isOpen = expanded === c.slug;
            return (
              <li key={c.slug} className={s.className} style={s.style}>
                <div className="flex items-center justify-between gap-4">
                  <Link href={`/shop/${c.slug}`} className={bigLink} onClick={close}>
                    {c.name}
                    {c.seasonal && <span className="eyebrow ml-2 align-middle text-stone-deep">Seasonal</span>}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : c.slug)}
                    aria-expanded={isOpen}
                    aria-controls={`menu-sub-${c.slug}`}
                    aria-label={`${isOpen ? "Hide" : "Show"} ${c.name} subcategories`}
                    className="inline-flex size-10 shrink-0 items-center justify-center hover:opacity-60"
                  >
                    {isOpen ? <Minus size={18} strokeWidth={1.25} aria-hidden /> : <Plus size={18} strokeWidth={1.25} aria-hidden />}
                  </button>
                </div>
                <div
                  id={`menu-sub-${c.slug}`}
                  className={clsx(
                    "grid transition-[grid-template-rows] duration-250 ease-house",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                  inert={!isOpen}
                >
                  <ul className="overflow-hidden">
                    {c.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={subcategoryHref(c.slug, sub)}
                          onClick={close}
                          className="label block py-1.5 pl-0.5 text-stone-deep hover:text-ink"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                    <li className="pb-3" />
                  </ul>
                </div>
              </li>
            );
          })}
          {after.map((l) => {
            const s = stagger();
            return (
              <li key={l.label} className={s.className} style={s.style}>
                <Link href={l.href} className={bigLink} onClick={close}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 border-t border-line pt-6">
          <ul className="flex flex-col gap-2">
            {[
              { href: "/account", label: "Account" },
              { href: "/wishlist", label: "Wishlist" },
              { href: "/how-it-works#faq", label: "Help" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} onClick={close} className="label hover:underline hover:underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <p className="eyebrow text-stone-deep">Pickup points · {CAMPUS.handoffHours}</p>
            <p className="mt-2 leading-relaxed">{PICKUP_SPOTS.map((s) => s.name).join(" · ")}</p>
          </div>
        </div>
      </nav>
    </Sheet>
  );
}

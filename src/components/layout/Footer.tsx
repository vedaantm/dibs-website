import Link from "next/link";
import { CAMPUS } from "@/data/campus";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/site";
import { Newsletter } from "./Newsletter";
import { PhotoCredits } from "./PhotoCredits";

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: CATEGORIES.map((c) => ({ href: `/shop/${c.slug}`, label: c.name })),
  },
  {
    title: "Dibs",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/list-your-gear", label: "List your gear" },
      { href: "/request", label: "Request an item" },
      { href: "/how-it-works#pickup", label: "Pickup points" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/how-it-works#deposits", label: "Deposits & damage" },
      { href: "/how-it-works#late-returns", label: "Late returns" },
      { href: "/how-it-works#verification", label: "Verification" },
      { href: `mailto:${SITE.contactEmail}`, label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-[13px] text-paper">
      <div className="mx-auto max-w-[1600px] px-4 pt-14 md:px-6 md:pt-20">
        <Newsletter />

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-paper/15 pt-10 md:grid-cols-4">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="label">{c.title}</h2>
              <ul className="mt-4 flex flex-col gap-2 text-paper/80">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="underline-offset-4 hover:text-paper hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className="label">Pilot</h2>
            <address className="mt-4 flex flex-col gap-2 not-italic text-paper/80">
              <span>{CAMPUS.area}</span>
              <span>Handoffs {CAMPUS.handoffHours}</span>
              <a href={`mailto:${SITE.contactEmail}`} className="underline-offset-4 hover:text-paper hover:underline">
                {SITE.contactEmail}
              </a>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/15 py-6 text-[12px] text-paper/75 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <li>© 2026 Dibs Student Rentals</li>
            <li>Pilot preview — listings are sample inventory</li>
            <li>
              <Link href="/privacy" className="underline-offset-4 hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="underline-offset-4 hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <PhotoCredits />
            </li>
          </ul>
          <ul aria-label="Accepted payment methods" className="flex flex-wrap gap-2">
            {["Visa", "Mastercard", "Amex", "Apple Pay"].map((p) => (
              <li key={p} className="border border-paper/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none -mb-[4.5vw] select-none overflow-hidden text-center leading-[0.8]">
        <span
          className="block whitespace-nowrap font-[family-name:var(--font-wordmark)] text-[18vw] tracking-[0.18em] text-paper/[0.08]"
          style={{ fontWeight: 200, fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
        >
          DIBS
        </span>
      </div>
    </footer>
  );
}

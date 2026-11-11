import Link from "next/link";

/**
 * Ink bar that slides up from the bottom of the card image on hover.
 * Phase 1: links to the item. Phase 2.4 turns it into the Quick Dibs popover.
 */
export function QuickDibsTrigger({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/item/${slug}`}
      aria-label={`Quick dibs: ${name}`}
      className="label absolute inset-x-0 bottom-0 z-[3] hidden h-10 translate-y-full items-center justify-center bg-ink text-paper opacity-0 transition-[transform,opacity] duration-250 ease-house group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 md:flex"
    >
      Quick dibs
    </Link>
  );
}

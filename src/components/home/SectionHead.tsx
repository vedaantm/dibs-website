import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Section title left, optional "SHOP ALL →" style link right. */
export function SectionHead({ title, id, href, linkLabel }: { title: ReactNode; id?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {href && linkLabel && (
        <Link href={href} className="label group inline-flex shrink-0 items-center gap-2 pb-1">
          {linkLabel}
          <ArrowRight size={16} strokeWidth={1.25} aria-hidden className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

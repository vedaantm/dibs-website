import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { hasImage } from "@/lib/images";
import { getByCategory, lowestRate } from "@/lib/catalog";

const HERO = "/hero/textbooks.jpg";

/** 100svh full-bleed hero. One quiet line, bottom-center. The header sits transparent on top. */
export function Hero() {
  const from = Math.min(...getByCategory("textbooks").map((i) => lowestRate(i).amount));
  const photo = hasImage(HERO);
  return (
    <section
      aria-label="Textbooks this semester"
      className="on-dark relative -mt-[var(--header-h)] flex h-[100svh] min-h-[560px] flex-col overflow-hidden bg-lastlight text-paper"
    >
      {photo && (
        <>
          <Image src={HERO} alt="A stack of textbooks on a library desk" fill priority sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 opacity-55 mix-blend-multiply" style={{ background: "var(--g-lastlight)" }} />
        </>
      )}
      <div aria-hidden className="grain absolute inset-0" />

      <div className="relative z-[2] mx-auto w-full max-w-[1600px] px-4 pt-[calc(var(--header-h)+20px)] md:px-6 md:pt-[calc(var(--header-h)+28px)]">
        <Eyebrow tone="paper">Finals season / Fall 2026</Eyebrow>
      </div>

      <div className="relative z-[2] mt-auto flex justify-center px-4 pb-12 md:pb-16">
        <Link
          href="/shop/textbooks"
          className="group inline-flex items-center gap-3 text-[16px] font-medium uppercase tracking-[0.02em] md:text-[22px]"
        >
          <span>Textbooks from ${from} / week</span>
          <ArrowRight
            aria-hidden
            strokeWidth={1.25}
            className="size-5 transition-transform duration-200 ease-house group-hover:translate-x-1 md:size-6"
          />
        </Link>
      </div>
    </section>
  );
}

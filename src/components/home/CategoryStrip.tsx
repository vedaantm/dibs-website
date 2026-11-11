import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getByCategory, getCategories } from "@/lib/catalog";
import { gradientClass, hasImage } from "@/lib/images";

/** Atticus-style subcategory row: 2:3 thumbs, label + count. Scrolls with snap on mobile. */
export function CategoryStrip() {
  const cats = getCategories();
  return (
    <section aria-label="Categories" className="py-10 md:py-14">
      <Container>
        <ul className="no-scrollbar -mx-4 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-7 md:gap-6 md:overflow-visible md:px-0">
          {cats.map((c) => {
            const items = getByCategory(c.slug);
            const photo = items.map((i) => i.images[0]).find(hasImage);
            return (
              <li key={c.slug} className="w-[34vw] max-w-[160px] shrink-0 snap-start md:w-auto md:max-w-none">
                <Link href={`/shop/${c.slug}`} className="group block">
                  <div className="relative aspect-[2/3] overflow-hidden bg-blush">
                    {photo ? (
                      <Image
                        src={photo}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 14vw, 34vw"
                        className="object-contain p-[8%] mix-blend-multiply transition-transform duration-300 ease-house group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className={clsx(gradientClass[c.gradient], "grain absolute inset-0 transition-transform duration-300 ease-house group-hover:scale-[1.02]")}
                      />
                    )}
                  </div>
                  <p className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="label truncate">{c.shortName}</span>
                    <span className="tabular-nums text-stone-deep">{items.length}</span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

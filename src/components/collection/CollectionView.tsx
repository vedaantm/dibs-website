import Link from "next/link";
import { Fragment, Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { getCategory } from "@/lib/catalog";
import { CollectionBody } from "./CollectionBody";
import { CollectionLive } from "./CollectionLive";
import type { Scope } from "./scope";

function Breadcrumb({ scope }: { scope: Scope }) {
  const crumbs: { href?: string; label: string }[] = [{ href: "/", label: "Home" }];
  if (scope.kind === "search") crumbs.push({ label: "Search" });
  else if (scope.kind === "category") {
    crumbs.push({ href: "/shop", label: "Shop" });
    crumbs.push({ label: getCategory(scope.slug)!.shortName });
  } else crumbs.push({ label: "Shop" });
  return (
    <nav aria-label="Breadcrumb" className="pt-6">
      <ol className="eyebrow flex flex-wrap gap-1.5 text-stone-deep">
        {crumbs.map((c, i) => (
          <Fragment key={c.label}>
            {i > 0 && <li aria-hidden>/</li>}
            <li>
              {c.href ? (
                <Link href={c.href} className="hover:text-ink hover:underline hover:underline-offset-4">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {c.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Server shell for /shop, /shop/[category] and /search. The static fallback renders the
 * unfiltered collection; the live client part reads filters from the URL inside Suspense.
 */
export function CollectionView({ scope }: { scope: Scope }) {
  return (
    <>
      <Container>
        <Breadcrumb scope={scope} />
      </Container>
      <Suspense fallback={<CollectionBody scope={scope} query="" interactive={false} />}>
        <CollectionLive scope={scope} />
      </Suspense>
    </>
  );
}

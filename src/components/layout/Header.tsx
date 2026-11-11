"use client";

import clsx from "clsx";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { Wordmark } from "@/components/ui/Wordmark";
import { useHydrated } from "@/lib/hooks";
import { useBagCount } from "@/store/bag";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

function useScrolledPast(px: number) {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > px,
    () => false,
  );
}

const iconLink =
  "relative inline-flex size-10 shrink-0 items-center justify-center transition-opacity duration-200 hover:opacity-70";

/**
 * Sticky 3-column header: MENU + search | wordmark | wishlist, account, bag.
 * Over the homepage hero it is transparent with paper text until 80px of scroll.
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  const scrolled = useScrolledPast(80);
  const { menuOpen, searchOpen } = useUI();
  const openMenu = useUI((s) => s.openMenu);
  const openSearch = useUI((s) => s.openSearch);
  const openBag = useUI((s) => s.openBag);
  const bagPulse = useUI((s) => s.bagPulse);
  const hydrated = useHydrated();
  const wishCount = useWishlist((s) => s.slugs.length);
  const bagCount = useBagCount();

  const transparent = overHero && !scrolled && !menuOpen && !searchOpen;

  // "/" opens search from anywhere (unless typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 h-[var(--header-h)] border-b transition-[background-color,color,border-color] duration-200 ease-house",
        transparent ? "on-dark border-transparent bg-transparent text-paper" : "border-line bg-paper text-ink",
      )}
    >
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-2 md:px-4">
        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="label inline-flex h-10 items-center px-2 transition-opacity duration-200 hover:opacity-70"
          >
            Menu
          </button>
          <IconButton
            icon={Search}
            label="Search"
            onClick={openSearch}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-keyshortcuts="/"
          />
        </div>

        <Link href="/" className="inline-flex justify-center px-2">
          <Wordmark tone={transparent ? "paper" : "ink"} size="md" />
            <span className="sr-only">, home</span>
        </Link>

        <div className="flex items-center justify-end">
          <Link
            href="/wishlist"
            className={iconLink}
            aria-label={hydrated && wishCount ? `Wishlist, ${wishCount} saved` : "Wishlist"}
          >
            <Heart size={20} strokeWidth={1.25} aria-hidden />
            {hydrated && wishCount > 0 && (
              <span
                aria-hidden
                className="absolute right-0 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center overflow-hidden rounded-full bg-navy px-1 text-[10px] font-bold leading-none text-white tabular-nums"
              >
                <span key={wishCount} className="animate-tick">
                  {wishCount}
                </span>
              </span>
            )}
          </Link>
          <Link href="/account" className={clsx(iconLink, "hidden sm:inline-flex")} aria-label="My Dibs account">
            <User size={20} strokeWidth={1.25} aria-hidden />
          </Link>
          <IconButton
            icon={ShoppingBag}
            label="Bag"
            onClick={openBag}
            aria-haspopup="dialog"
            count={hydrated ? bagCount : undefined}
            pulseKey={bagPulse}
          />
        </div>
      </div>
    </header>
  );
}

/** Reads the pathname (needs a Suspense boundary under Cache Components). */
export function HeaderWithPath() {
  const pathname = usePathname();
  return <Header overHero={pathname === "/"} />;
}

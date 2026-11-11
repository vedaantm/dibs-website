import { Suspense } from "react";
import { BagDrawer } from "@/components/bag/BagDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header, HeaderWithPath } from "@/components/layout/Header";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

/** Full site chrome: announcement bar, sticky header, overlays, footer. Checkout uses its own layout. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[80] bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Suspense fallback={<Header />}>
        <HeaderWithPath />
      </Suspense>
      <main id="main" className="min-h-[60svh]">
        {children}
      </main>
      <Footer />
      <MenuOverlay />
      <SearchOverlay />
      <BagDrawer />
    </>
  );
}

import { Suspense } from "react";
import { BagDrawer } from "@/components/bag/BagDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

/** Global 404 for unmatched URLs, with the full site chrome. */
export default function NotFound() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main id="main">
        <NotFoundView />
      </main>
      <Footer />
      <MenuOverlay />
      <SearchOverlay />
      <BagDrawer />
    </>
  );
}

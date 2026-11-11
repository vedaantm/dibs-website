import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Wordmark } from "@/components/ui/Wordmark";

/** Focused checkout chrome: no announcement bar, menu or footer. */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-20 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/">
              <Wordmark size="sm" />
            <span className="sr-only">, home</span>
            </Link>
            <Eyebrow className="hidden sm:block">Secure checkout</Eyebrow>
          </div>
          <Link href="/bag" className="label inline-flex items-center gap-1.5 hover:opacity-70">
            <ArrowLeft size={16} strokeWidth={1.25} aria-hidden /> Bag
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line">
        <nav aria-label="Checkout footer" className="mx-auto flex h-12 max-w-[1600px] items-center gap-4 px-4 text-[12px] text-stone-deep md:px-6">
          <Link href="/privacy" className="hover:text-ink hover:underline">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/terms" className="hover:text-ink hover:underline">
            Terms
          </Link>
          <span aria-hidden>·</span>
          <Link href="/how-it-works#faq" className="hover:text-ink hover:underline">
            Help
          </Link>
        </nav>
      </footer>
    </div>
  );
}

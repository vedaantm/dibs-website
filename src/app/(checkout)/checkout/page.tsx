import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Container className="h-[70svh]" aria-busy="true" />}>
      <CheckoutFlow />
    </Suspense>
  );
}

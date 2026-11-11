import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmation } from "@/components/order/Confirmation";

export const metadata: Metadata = { title: "You've got dibs", robots: { index: false } };

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className="h-[60svh] bg-lastlight" aria-busy="true" />}>
      <Confirmation />
    </Suspense>
  );
}

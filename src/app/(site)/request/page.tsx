import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestForm } from "@/components/content/RequestForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = { title: "Request an item", description: "Can't find it on Dibs? Post a request and we'll ping lenders on campus who have one." };

export default function RequestPage() {
  return (
    <Container className="grid gap-10 pb-24 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16 md:pt-20">
      <div>
        <Eyebrow>Request an item</Eyebrow>
        <h1 className="section-title mt-3">Can&apos;t find it? Ask the campus.</h1>
        <p className="mt-4 max-w-sm text-stone-deep">
          Browsing is faster: most things are already listed. If yours isn&apos;t, tell us what and when, and we&apos;ll ask lenders who
          have one.
        </p>
      </div>
      <Suspense fallback={<div className="h-96" aria-hidden />}>
        <RequestForm />
      </Suspense>
    </Container>
  );
}

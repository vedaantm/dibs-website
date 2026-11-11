import type { Metadata } from "next";
import { PolicyText } from "@/components/checkout/PolicyText";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Container className="pb-24 pt-12 md:pt-20">
      <Eyebrow>Terms · Pilot preview</Eyebrow>
      <h1 className="section-title mb-4 mt-3">Terms</h1>
      <p className="mb-10 max-w-xl text-stone-deep">
        Plain-language terms for the NYU pilot. This is a demo: listings are sample inventory and no payments are taken.
      </p>
      <div className="max-w-2xl">
        <PolicyText />
      </div>
    </Container>
  );
}

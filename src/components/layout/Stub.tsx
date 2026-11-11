import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Placeholder for routes built in later phases. */
export function Stub({ title, phase, note }: { title: string; phase: 2 | 3; note?: string }) {
  return (
    <Container className="py-20 md:py-28">
      <Eyebrow>Coming in phase {phase}</Eyebrow>
      <h1 className="section-title mt-3">{title}</h1>
      <p className="mt-4 max-w-md text-stone-deep">{note ?? "This page is being built. The shop is open in the meantime."}</p>
      <Link href="/" className="label mt-8 inline-block underline underline-offset-4 hover:no-underline">
        Back to the shop
      </Link>
    </Container>
  );
}

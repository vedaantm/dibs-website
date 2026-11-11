import type { Metadata } from "next";
import { ListingForm } from "@/components/content/ListingForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "List your gear",
  description: "List textbooks, gear and formalwear for NYU students to rent. Free to list; 5–10% fee only on completed rentals, first one free.",
};

export default function ListYourGearPage() {
  return (
    <Container className="pb-24 pt-12 md:pt-20">
      <Eyebrow>Lenders</Eyebrow>
      <h1 className="section-title mt-3 max-w-3xl">Your skis are in storage 50 weeks a year.</h1>
      <p className="mb-10 mt-4 max-w-lg text-stone-deep">
        Four steps, about three minutes. Free to list. Dibs takes 5–10% only when a rental completes, and your first one is free.
      </p>
      <ListingForm />
    </Container>
  );
}

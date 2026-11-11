import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { WishlistGrid } from "./WishlistGrid";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <Container className="pb-24 pt-10 md:pt-14">
      <h1 className="section-title mb-6">Wishlist</h1>
      <WishlistGrid />
    </Container>
  );
}

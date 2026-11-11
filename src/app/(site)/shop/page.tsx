import type { Metadata } from "next";
import { CollectionView } from "@/components/collection/CollectionView";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Rent textbooks, sports gear, cameras, dorm and tailgate gear and formalwear from verified NYU students.",
};

export default function ShopPage() {
  return <CollectionView scope={{ kind: "all" }} />;
}

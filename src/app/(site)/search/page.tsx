import type { Metadata } from "next";
import { CollectionView } from "@/components/collection/CollectionView";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return <CollectionView scope={{ kind: "search" }} />;
}

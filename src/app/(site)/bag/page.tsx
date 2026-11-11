import type { Metadata } from "next";
import { BagPage } from "@/components/bag/BagPage";

export const metadata: Metadata = { title: "Bag" };

export default function Page() {
  return <BagPage />;
}

import { Stub } from "@/components/layout/Stub";
import { ITEMS } from "@/data/items";

export function generateStaticParams() {
  return ITEMS.map((i) => ({ slug: i.slug }));
}

export default function Page() {
  return <Stub title="Item" phase={2} />;
}

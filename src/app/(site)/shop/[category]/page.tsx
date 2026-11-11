import { Stub } from "@/components/layout/Stub";
import { CATEGORIES } from "@/data/categories";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default function Page() {
  return <Stub title="Category" phase={2} />;
}

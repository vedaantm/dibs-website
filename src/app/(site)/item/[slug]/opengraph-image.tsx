import { ITEMS } from "@/data/items";
import { getItem, lowestRate } from "@/lib/catalog";
import { formatRate } from "@/lib/format";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "A rental listing on Dibs";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return ITEMS.map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return ogImage({ line: "Student rentals at NYU" });
  const rate = lowestRate(item);
  return ogImage({ line: `${item.brand} ${item.name} · ${formatRate(rate.amount, rate.unit)}`, eyebrow: "Rent it at NYU" });
}

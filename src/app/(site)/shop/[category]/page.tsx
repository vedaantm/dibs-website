import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionView } from "@/components/collection/CollectionView";
import { CATEGORIES } from "@/data/categories";
import type { CategorySlug } from "@/data/types";
import { getCategory } from "@/lib/catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Not found" };
  return { title: cat.name, description: cat.blurb };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  if (!getCategory(category)) notFound();
  return <CollectionView scope={{ kind: "category", slug: category as CategorySlug }} />;
}

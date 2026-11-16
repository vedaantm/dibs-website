import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { ITEMS } from "@/data/items";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/how-it-works", "/pricing", "/standards", "/list-your-gear", "/request", "/terms", "/privacy"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...CATEGORIES.map((c) => ({ url: `${SITE.url}/shop/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...ITEMS.map((i) => ({ url: `${SITE.url}/item/${i.slug}`, lastModified: i.listedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}

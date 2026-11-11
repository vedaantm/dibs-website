import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Pilot preview: keep crawlers out until launch. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

import type { Edit } from "./types";

/** Curated edits, in homepage order. Linked as /shop?edit=<slug>. */
export const EDITS: Edit[] = [
  {
    slug: "finals-week",
    title: "Finals Week",
    blurb: "Every textbook on the intro syllabi, plus the calculator your exam allows.",
    gradient: "chalk",
    itemSlugs: [
      "campbell-biology-12e",
      "stewart-calculus-9e",
      "mankiw-economics-10e",
      "klein-organic-chemistry-4e",
      "myers-psychology-13e",
      "ti-84-plus-ce",
    ],
  },
  {
    slug: "ski-trip-kit",
    title: "Ski Trip Kit",
    blurb: "Board or skis, pants and a duffel. About $150 for the weekend, all in.",
    gradient: "turf",
    itemSlugs: [
      "burton-ripcord-154",
      "rossignol-experience-80",
      "tnf-freedom-insulated",
      "patagonia-black-hole-55",
      "gopro-hero13-black",
    ],
  },
  {
    slug: "tailgate-saturday",
    title: "Tailgate Saturday",
    blurb: "Cooler, grill, speaker, cornhole. Pick up Friday, back Sunday.",
    gradient: "turf",
    itemSlugs: ["yeti-tundra-45", "weber-q1200", "jbl-charge-5", "gosports-cornhole"],
  },
  {
    slug: "formal-season",
    title: "Formal Season",
    blurb: "Suits, a tux and two dresses, cleaned between rentals. Steamer optional, recommended.",
    gradient: "dusk",
    itemSlugs: [
      "suitsupply-havana-navy",
      "suitsupply-lazio-tuxedo",
      "reformation-satin-slip-midi",
      "lauren-jersey-gown-navy",
      "rowenta-xcel-steamer",
    ],
  },
];

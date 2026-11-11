import type { Category } from "./types";

/** Ordered by customer research: textbooks first, sports second; formal and costumes are seasonal. */
export const CATEGORIES: Category[] = [
  {
    slug: "textbooks",
    name: "Textbooks",
    shortName: "Textbooks",
    blurb: "Same edition your professor assigned. A fraction of the bookstore price.",
    gradient: "chalk",
    subcategories: ["Biology", "Math", "Economics", "Chemistry", "Psychology"],
  },
  {
    slug: "sports",
    name: "Sports & Outdoors",
    shortName: "Sports",
    blurb: "Gear for the one trip a year. Back in storage when you are.",
    gradient: "turf",
    subcategories: ["Snow", "Racket", "Camping", "Travel"],
  },
  {
    slug: "tech",
    name: "Cameras & Tech",
    shortName: "Tech",
    blurb: "Shoot the project, return the camera. Calculators by the semester.",
    gradient: "dusk",
    subcategories: ["Calculators", "Cameras", "Audio & Video"],
  },
  {
    slug: "dorm",
    name: "Dorm & Move-in",
    shortName: "Dorm",
    blurb: "Things you need twice a year and have nowhere to keep.",
    gradient: "chalk",
    subcategories: ["Cleaning", "Move-in", "Garment care"],
  },
  {
    slug: "tailgate",
    name: "Tailgate & Events",
    shortName: "Tailgate",
    blurb: "Cooler, grill, speaker. Everything for one Saturday.",
    gradient: "turf",
    subcategories: ["Coolers", "Audio", "Grills", "Games"],
  },
  {
    slug: "formal",
    name: "Formal & Outfits",
    shortName: "Formal",
    blurb: "Tux for formal. Back by Sunday. Cleaned between rentals.",
    gradient: "dusk",
    subcategories: ["Suits", "Tuxedos", "Dresses", "Outerwear"],
    seasonal: true,
  },
  {
    slug: "costumes",
    name: "Costumes",
    shortName: "Costumes",
    blurb: "Worn once, by someone else, then cleaned. That's the point.",
    gradient: "lastlight",
    subcategories: ["Decades", "Party", "Western"],
    seasonal: true,
  },
];

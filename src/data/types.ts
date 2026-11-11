export type GradientName = "turf" | "dusk" | "lastlight" | "chalk";

export type CategorySlug = "textbooks" | "sports" | "tech" | "dorm" | "tailgate" | "formal" | "costumes";

export type Category = {
  slug: CategorySlug;
  name: string;
  /** Short label for tight spaces (category strip, breadcrumbs). */
  shortName: string;
  blurb: string;
  gradient: GradientName;
  subcategories: string[];
  seasonal?: boolean;
};

export type Lender = {
  id: string;
  firstName: string;
  lastInitial: string;
  school: string;
  gradYear: number;
  rating: number;
  rentalsCompleted: number;
  responseTime: string;
  verified: true;
  /** "Feb 2025" */
  joined: string;
  avatarInitials: string;
  homePickupSpotId: PickupSpotId;
};

export type PickupSpotId = "bobst" | "kimmel" | "palladium" | "lipton" | "paulson" | "tandon";

export type PickupSpot = {
  id: PickupSpotId;
  name: string;
  /** Short name for card meta lines. */
  shortName: string;
  address: string;
  note: string;
};

export type Rates = {
  day?: number;
  weekend?: number;
  week?: number;
  semester?: number;
};

export type Condition = "Like new" | "Excellent" | "Good";

export type Review = {
  author: string;
  rating: number;
  /** ISO date */
  date: string;
  text: string;
};

export type Item = {
  slug: string;
  name: string;
  brand: string;
  categorySlug: CategorySlug;
  subcategory: string;
  retailValue: number;
  rates: Rates;
  /** Effective deposit in dollars: 0 when retailValue is under $100. */
  deposit: number;
  condition: Condition;
  size?: string;
  description: string;
  whatsIncluded: string[];
  specs: { label: string; value: string }[];
  lenderId: string;
  pickupSpotIds: PickupSpotId[];
  images: string[];
  imageQuery: string;
  /** ISO date */
  listedAt: string;
  /** ISO dates (yyyy-MM-dd) */
  blockedDates: string[];
  minDays?: number;
  tags: string[];
  cleanedBetweenRentals?: boolean;
  reviews: Review[];
};

export type Edit = {
  slug: string;
  title: string;
  blurb: string;
  gradient: GradientName;
  itemSlugs: string[];
};

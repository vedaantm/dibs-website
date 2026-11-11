import type { PickupSpot, PickupSpotId } from "./types";

/**
 * Pilot campus config. Swap this file to run the demo at another school.
 * CATALOG_DATE is the day the sample listings were snapshotted; "Just listed"
 * tags are measured from it so server-rendered pages stay deterministic.
 */
export const CAMPUS = {
  name: "NYU",
  longName: "NYU Washington Square",
  emailDomain: "nyu.edu",
  city: "New York",
  area: "Washington Square, New York",
  handoffHours: "9am–10pm daily",
  salesTaxRate: 0.08875,
  catalogDate: "2026-11-11",
  term: "Fall 2026",
} as const;

export const PICKUP_SPOTS: PickupSpot[] = [
  {
    id: "bobst",
    name: "Bobst Library",
    shortName: "Bobst",
    address: "70 Washington Square South",
    note: "Main lobby, by the security desk",
  },
  {
    id: "kimmel",
    name: "Kimmel Center",
    shortName: "Kimmel",
    address: "60 Washington Square South",
    note: "Ground floor, Washington Sq side entrance",
  },
  {
    id: "palladium",
    name: "Palladium Hall",
    shortName: "Palladium",
    address: "140 E 14th St",
    note: "Lobby, by the mailroom",
  },
  {
    id: "lipton",
    name: "Lipton Hall",
    shortName: "Lipton",
    address: "33 Washington Square West",
    note: "Front desk",
  },
  {
    id: "paulson",
    name: "Paulson Center",
    shortName: "Paulson",
    address: "181 Mercer St",
    note: "Mercer St entrance",
  },
  {
    id: "tandon",
    name: "Tandon",
    shortName: "Tandon",
    address: "6 MetroTech Center, Brooklyn",
    note: "Rogers Hall lobby",
  },
];

export const PICKUP_SPOT_IDS = PICKUP_SPOTS.map((s) => s.id) as PickupSpotId[];

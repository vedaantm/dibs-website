/**
 * Verification levels. Each level includes the ones before it:
 *   EMAIL VERIFIED  — confirmed an .edu address with a one-time code
 *   ID VERIFIED     — plus a student ID photo checked by Dibs
 *   TRUSTED LENDER  — plus 3+ completed rentals as a lender and a 4.5+ rating
 */
export type VerificationLevel = "none" | "email" | "id" | "trusted";

export type VerificationFacts = {
  emailVerified: boolean;
  idVerified: boolean;
  /** Completed rentals as a lender. */
  rentalsCompleted: number;
  /** Average lender rating, or null with no ratings yet. */
  rating: number | null;
};

export const TRUSTED_MIN_RENTALS = 3;
export const TRUSTED_MIN_RATING = 4.5;
/** Listings at or above this retail value need an ID-verified lender. */
export const ID_REQUIRED_RETAIL = 100;

export const LEVEL_LABEL: Record<VerificationLevel, string> = {
  none: "Not verified",
  email: "Email verified",
  id: "ID verified",
  trusted: "Trusted lender",
};

export const LEVEL_DESCRIPTION: Record<Exclude<VerificationLevel, "none">, string> = {
  email: "Confirmed an @nyu.edu address with a one-time code.",
  id: "Student ID photo checked by Dibs. Required to list anything worth $100+.",
  trusted: `ID verified, ${TRUSTED_MIN_RENTALS}+ completed rentals and a ${TRUSTED_MIN_RATING}+ rating.`,
};

const RANK: Record<VerificationLevel, number> = { none: 0, email: 1, id: 2, trusted: 3 };

export function verificationLevel(f: VerificationFacts): VerificationLevel {
  if (!f.emailVerified) return "none";
  if (!f.idVerified) return "email";
  const trusted = f.rentalsCompleted >= TRUSTED_MIN_RENTALS && f.rating !== null && f.rating >= TRUSTED_MIN_RATING;
  return trusted ? "trusted" : "id";
}

export function atLeast(level: VerificationLevel, min: VerificationLevel): boolean {
  return RANK[level] >= RANK[min];
}

/** The level a lender needs to list an item of this retail value. */
export function requiredLevelToList(retailValue: number): VerificationLevel {
  return retailValue >= ID_REQUIRED_RETAIL ? "id" : "email";
}

export function canList(level: VerificationLevel, retailValue: number): boolean {
  return atLeast(level, requiredLevelToList(retailValue));
}

/** What's still missing for TRUSTED LENDER, in plain words. Empty once trusted. */
export function trustedGap(f: VerificationFacts): string[] {
  const gaps: string[] = [];
  if (!f.emailVerified) gaps.push("Verify your @nyu.edu email");
  if (!f.idVerified) gaps.push("Verify your student ID");
  const left = TRUSTED_MIN_RENTALS - f.rentalsCompleted;
  if (left > 0) gaps.push(`${left} more completed rental${left === 1 ? "" : "s"} as a lender`);
  if (f.rating === null || f.rating < TRUSTED_MIN_RATING) gaps.push(`A ${TRUSTED_MIN_RATING}+ lender rating`);
  return gaps;
}

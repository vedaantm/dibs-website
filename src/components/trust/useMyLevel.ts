"use client";

import { useHydrated } from "@/lib/hooks";
import { verificationLevel, type VerificationFacts, type VerificationLevel } from "@/lib/verification";
import { useOrders } from "@/store/orders";
import { useProfile } from "@/store/trust";

/**
 * This browser's own verification. An email that came through checkout counts as verified.
 * Nobody here has lent anything yet, so TRUSTED LENDER isn't reachable in the demo.
 */
export function useMyVerification(): { level: VerificationLevel; facts: VerificationFacts; email: string | null; ready: boolean } {
  const ready = useHydrated();
  const profileEmail = useProfile((s) => s.email);
  const idVerified = useProfile((s) => s.idVerified);
  const orderEmail = useOrders((s) => s.orders[0]?.email);
  const email = profileEmail ?? orderEmail ?? null;
  const facts: VerificationFacts = { emailVerified: ready && Boolean(email), idVerified: ready && idVerified, rentalsCompleted: 0, rating: null };
  return { level: verificationLevel(facts), facts, email: ready ? email : null, ready };
}

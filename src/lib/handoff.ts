/** Condition check at pickup and return: both sides photograph the item and confirm it. */
export type Stage = "pickup" | "return";
export type Side = "renter" | "lender";
export type Verdict = "match" | "mismatch";

export type SideCheck = {
  /** Downscaled data URL, kept in this browser only. */
  photo: string;
  verdict: Verdict;
  note?: string;
  /** ISO timestamp */
  at: string;
};

export type StageCheck = Partial<Record<Side, SideCheck>>;
export type HandoffChecks = Partial<Record<Stage, StageCheck>>;

export type StageState = "open" | "partial" | "matched" | "mismatch";

export const NOTE_MAX = 140;
export const SIDES: Side[] = ["renter", "lender"];
export const STAGES: Stage[] = ["pickup", "return"];

/** Any "Doesn't match" settles the stage straight away; otherwise both sides must confirm. */
export function stageState(s: StageCheck | undefined): StageState {
  const done = SIDES.filter((side) => s?.[side]);
  if (done.some((side) => s![side]!.verdict === "mismatch")) return "mismatch";
  if (done.length === SIDES.length) return "matched";
  return done.length ? "partial" : "open";
}

export type CheckInput = { photo: string | null; verdict: Verdict | null; note: string };

/** Returns an error message, or null when the side's check can be saved. */
export function validateSideCheck(c: CheckInput): string | null {
  if (!c.photo) return "Take a condition photo first.";
  if (!c.verdict) return "Choose Matches the listing or Doesn't match.";
  if (c.verdict === "mismatch" && !c.note.trim()) return "Add a short note on what's different.";
  if (c.note.length > NOTE_MAX) return `Keep the note under ${NOTE_MAX} characters.`;
  return null;
}

/** The next stage and side waiting for a check, or null when nothing is left to do. */
export function nextCheck(checks: HandoffChecks | undefined): { stage: Stage; side: Side } | null {
  const pickup = stageState(checks?.pickup);
  if (pickup === "mismatch") return null;
  if (pickup !== "matched") return { stage: "pickup", side: checks?.pickup?.renter ? "lender" : "renter" };
  const ret = stageState(checks?.return);
  if (ret === "mismatch" || ret === "matched") return null;
  return { stage: "return", side: checks?.return?.renter ? "lender" : "renter" };
}

/** A "Doesn't match" at pickup cancels the rental with a full refund. */
export function cancelsRental(stage: Stage, verdict: Verdict): boolean {
  return stage === "pickup" && verdict === "mismatch";
}

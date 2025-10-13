/**
 * Represents the state of fat intake
 * Simplified: only "complete" when target is met, "default" otherwise
 */
export type FatIconState = "complete" | "default";

/**
 * Determines the icon state based on current fat intake vs. target.
 * Shows checkmark when target is met (>= 100%)
 *
 * @param currentFatGrams - Current consumed fat in grams
 * @param targetFatGrams - Target fat in grams
 * @returns Icon state: "complete" (target met) or "default"
 *
 * @example
 * getFatIconState(50, 50) // returns "complete"
 * getFatIconState(60, 50) // returns "complete"
 * getFatIconState(30, 50) // returns "default"
 */
export const getFatIconState = (
  currentFatGrams: number,
  targetFatGrams: number
): FatIconState => {
  if (targetFatGrams === 0) return "default";
  return currentFatGrams >= targetFatGrams ? "complete" : "default";
};

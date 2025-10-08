import { FAT_CALCULATION } from "./constants";

/**
 * Represents the fat intake range in grams
 */
export interface FatRange {
  /** Minimum recommended fat in grams (20% of calories) */
  minGrams: number;
  /** Maximum recommended fat in grams (35% of calories) */
  maxGrams: number;
}

/**
 * Represents the state of fat intake
 */
export type FatIconState = "complete" | "warning" | "default";

/**
 * Calculates the recommended fat range based on target calories.
 * Fat should be between 20-35% of total calorie intake.
 *
 * @param caloriesTarget - The target daily calorie intake
 * @param fatMinGrams - The minimum fat baseline (20% of calories)
 * @returns Object containing min and max fat in grams
 *
 * @example
 * calculateFatRange(2000, 44)
 * // returns { minGrams: 44, maxGrams: 78 }
 * // 20% = (2000 * 0.20) / 9 ≈ 44g
 * // 35% = (2000 * 0.35) / 9 ≈ 78g
 */
export const calculateFatRange = (
  caloriesTarget: number,
  fatMinGrams: number
): FatRange => {
  const maxGrams = caloriesTarget > 0
    ? Math.round((caloriesTarget * FAT_CALCULATION.MAX_PERCENTAGE) / FAT_CALCULATION.CALORIES_PER_GRAM)
    : 0;

  return {
    minGrams: fatMinGrams,
    maxGrams,
  };
};

/**
 * Determines the icon state based on current fat intake vs. target range.
 *
 * @param currentFatGrams - Current consumed fat in grams
 * @param minGrams - Minimum recommended fat
 * @param maxGrams - Maximum recommended fat
 * @returns Icon state: "complete" (in range), "warning" (above max), or "default"
 *
 * @example
 * getFatIconState(50, 44, 78) // returns "complete"
 * getFatIconState(90, 44, 78) // returns "warning"
 * getFatIconState(30, 44, 78) // returns "default"
 */
export const getFatIconState = (
  currentFatGrams: number,
  minGrams: number,
  maxGrams: number
): FatIconState => {
  if (maxGrams === 0) return "default";

  const isInRange = currentFatGrams >= minGrams && currentFatGrams <= maxGrams;
  const isAboveMax = currentFatGrams > maxGrams;

  if (isAboveMax) return "warning";
  if (isInRange) return "complete";
  return "default";
};

/**
 * Formats the fat range as a label string.
 *
 * @param minGrams - Minimum recommended fat
 * @param maxGrams - Maximum recommended fat
 * @returns Formatted string like "44-78g", or null if minGrams is 0
 *
 * @example
 * formatFatRangeLabel(44, 78) // returns "44-78g"
 * formatFatRangeLabel(0, 0) // returns null
 */
export const formatFatRangeLabel = (
  minGrams: number,
  maxGrams: number
): string | null => {
  if (minGrams === 0) return null;
  return `${minGrams}-${maxGrams}g`;
};

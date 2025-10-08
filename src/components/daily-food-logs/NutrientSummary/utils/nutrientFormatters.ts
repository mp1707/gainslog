import { ChevronDown, ChevronsDown, CircleCheckBig } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

/**
 * Returns the appropriate label for delta display based on whether target is exceeded.
 *
 * @param isOver - Whether the current value exceeds the target
 * @returns "over" if exceeded, "remaining" if under target
 *
 * @example
 * formatDeltaLabel(true) // returns "over"
 * formatDeltaLabel(false) // returns "remaining"
 */
export const formatDeltaLabel = (isOver: boolean): string => {
  return isOver ? "over" : "remaining";
};

/**
 * Returns the appropriate chevron icon based on completion percentage.
 *
 * @param percentage - The completion percentage (0-100+)
 * @returns ChevronsDown (double chevron) if ≥100%, ChevronDown (single) otherwise
 *
 * @example
 * getChevronIcon(95) // returns ChevronDown
 * getChevronIcon(105) // returns ChevronsDown
 */
export const getChevronIcon = (percentage: number): LucideIcon => {
  return percentage >= 100 ? ChevronsDown : ChevronDown;
};

/**
 * Returns the appropriate icon for a nutrient based on completion state.
 *
 * @param defaultIcon - The default icon to use
 * @param isComplete - Whether the nutrient target is complete
 * @param nutrientKey - The nutrient type (only "protein" shows completion icon)
 * @returns CircleCheckBig if complete and protein, defaultIcon otherwise
 *
 * @example
 * getNutrientIcon(BicepsFlexed, true, "protein") // returns CircleCheckBig
 * getNutrientIcon(BicepsFlexed, false, "protein") // returns BicepsFlexed
 * getNutrientIcon(Flame, true, "calories") // returns Flame
 */
export const getNutrientIcon = (
  defaultIcon: LucideIcon,
  isComplete: boolean,
  nutrientKey: "calories" | "protein"
): LucideIcon => {
  return isComplete && nutrientKey === "protein" ? CircleCheckBig : defaultIcon;
};

/**
 * Calculates the percentage of target achieved.
 *
 * @param current - Current value
 * @param target - Target value
 * @returns Percentage (0-100), capped at 100
 *
 * @example
 * calculatePercentage(50, 100) // returns 50
 * calculatePercentage(150, 100) // returns 100
 * calculatePercentage(50, 0) // returns 0
 */
export const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

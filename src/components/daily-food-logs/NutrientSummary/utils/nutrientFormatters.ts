import { ChevronDown, ChevronsDown, CircleCheckBig } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { TFunction } from "i18next";

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

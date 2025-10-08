/**
 * Formats a nutrient value by rounding it to the nearest whole number.
 *
 * @param value - The raw nutrient value to format
 * @returns The rounded value
 *
 * @example
 * formatNutrientValue(123.456) // returns 123
 * formatNutrientValue(99.9) // returns 100
 */
export const formatNutrientValue = (value: number): number => {
  return Math.round(value);
};

/**
 * Creates an accessibility label for a nutrient stat component.
 *
 * @param label - The nutrient label (e.g., "Protein", "Calories")
 * @param currentValue - The current consumed value
 * @param goalValue - The target goal value
 * @param unit - Optional unit of measurement (e.g., "g", "kcal")
 * @returns A formatted accessibility label string
 *
 * @example
 * createNutrientAccessibilityLabel("Protein", 120, 160, "g")
 * // returns "Protein: 120 of 160 g"
 *
 * createNutrientAccessibilityLabel("Calories", 1850, 2200)
 * // returns "Calories: 1850 of 2200"
 */
export const createNutrientAccessibilityLabel = (
  label: string,
  currentValue: number,
  goalValue: number,
  unit?: string
): string => {
  const formattedCurrent = formatNutrientValue(currentValue);
  const formattedGoal = formatNutrientValue(goalValue);
  const unitSuffix = unit ? ` ${unit}` : '';

  return `${label}: ${formattedCurrent} of ${formattedGoal}${unitSuffix}`;
};

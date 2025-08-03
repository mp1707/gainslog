/**
 * Nutrition calculation utilities for managing macro targets with calorie balance
 */

export interface MacroCalculationResult {
  fat: number;
  carbs: number;
}

/**
 * Calculate Fat and Carbs based on total calories and protein
 * This is used when protein is first set during the guided flow
 * 
 * @param totalCalories - Total calorie target
 * @param proteinInGrams - Protein target in grams
 * @returns Object with calculated fat and carbs values
 */
export const calculateMacrosFromProtein = (
  totalCalories: number,
  proteinInGrams: number
): MacroCalculationResult => {
  // Protein contributes 4 calories per gram
  const proteinCalories = proteinInGrams * 4;
  
  // Fat should be 30% of total calories (as per requirements)
  const fatInGrams = Math.round((totalCalories * 0.3) / 9);
  const fatCalories = fatInGrams * 9;
  
  // Remaining calories go to carbs
  const carbCalories = totalCalories - proteinCalories - fatCalories;
  const carbsInGrams = Math.round(carbCalories / 4);
  
  return {
    fat: fatInGrams,
    carbs: carbsInGrams,
  };
};

/**
 * Calculate carbs when protein changes (Fat stays constant)
 * Used in manual adjustment logic after initial setup
 * 
 * @param totalCalories - Total calorie target
 * @param newProteinInGrams - New protein value in grams
 * @param currentFatInGrams - Current fat value in grams (stays constant)
 * @returns New carbs value in grams
 */
export const calculateCarbsFromProteinChange = (
  totalCalories: number,
  newProteinInGrams: number,
  currentFatInGrams: number
): number => {
  const proteinCalories = newProteinInGrams * 4;
  const fatCalories = currentFatInGrams * 9;
  const carbCalories = totalCalories - proteinCalories - fatCalories;
  return Math.round(carbCalories / 4);
};

/**
 * Calculate carbs when fat changes (Protein stays constant)
 * Used in manual adjustment logic after initial setup
 * 
 * @param totalCalories - Total calorie target
 * @param currentProteinInGrams - Current protein value in grams (stays constant)
 * @param newFatInGrams - New fat value in grams
 * @returns New carbs value in grams
 */
export const calculateCarbsFromFatChange = (
  totalCalories: number,
  currentProteinInGrams: number,
  newFatInGrams: number
): number => {
  const proteinCalories = currentProteinInGrams * 4;
  const fatCalories = newFatInGrams * 9;
  const carbCalories = totalCalories - proteinCalories - fatCalories;
  return Math.round(carbCalories / 4);
};

/**
 * Calculate total calories when carbs change (Only scenario where macro overrides calorie target)
 * Used in manual adjustment logic after initial setup
 * 
 * @param proteinInGrams - Current protein value in grams
 * @param fatInGrams - Current fat value in grams
 * @param newCarbsInGrams - New carbs value in grams
 * @returns New total calories value
 */
export const calculateCaloriesFromCarbsChange = (
  proteinInGrams: number,
  fatInGrams: number,
  newCarbsInGrams: number
): number => {
  const proteinCalories = proteinInGrams * 4;
  const fatCalories = fatInGrams * 9;
  const carbCalories = newCarbsInGrams * 4;
  return proteinCalories + fatCalories + carbCalories;
};

/**
 * Calculate carbs when total calories change (Protein and Fat stay constant)
 * Used in manual adjustment logic after initial setup
 * 
 * @param newTotalCalories - New total calorie target
 * @param currentProteinInGrams - Current protein value in grams (stays constant)
 * @param currentFatInGrams - Current fat value in grams (stays constant)
 * @returns New carbs value in grams
 */
export const calculateCarbsFromCaloriesChange = (
  newTotalCalories: number,
  currentProteinInGrams: number,
  currentFatInGrams: number
): number => {
  const proteinCalories = currentProteinInGrams * 4;
  const fatCalories = currentFatInGrams * 9;
  const carbCalories = newTotalCalories - proteinCalories - fatCalories;
  return Math.round(carbCalories / 4);
};
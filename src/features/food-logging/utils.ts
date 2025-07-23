import { NutritionMergeResult } from '@/types';

/**
 * Merge user nutrition input with AI estimation data
 * User input takes precedence over AI values
 */
export const mergeNutritionData = (
  userCalories: string,
  userProtein: string,
  userCarbs: string,
  userFat: string,
  aiData?: { calories: number; protein: number; carbs: number; fat: number }
): NutritionMergeResult => {
  const parseUserValue = (value: string, fieldName: string): { value: number | undefined; error: string | null } => {
    if (!value.trim()) {
      return { value: undefined, error: null };
    }

    const parsed = parseFloat(value.trim());
    
    if (isNaN(parsed)) {
      return { value: undefined, error: `${fieldName} must be a valid number` };
    }
    
    if (parsed < 0) {
      return { value: undefined, error: `${fieldName} cannot be negative` };
    }
    
    if (parsed > 10000) {
      return { value: undefined, error: `${fieldName} value seems too high (max 10,000)` };
    }

    return { value: parsed, error: null };
  };

  const caloriesResult = parseUserValue(userCalories, "Calories");
  const proteinResult = parseUserValue(userProtein, "Protein");
  const carbsResult = parseUserValue(userCarbs, "Carbs");
  const fatResult = parseUserValue(userFat, "Fat");

  // Collect all validation errors
  const errors = [
    caloriesResult.error,
    proteinResult.error,
    carbsResult.error,
    fatResult.error,
  ].filter(Boolean) as string[];

  const userValues = {
    calories: caloriesResult.value,
    protein: proteinResult.value,
    carbs: carbsResult.value,
    fat: fatResult.value,
  };

  // Check if user provided all nutrition values
  const hasAllUserValues = userValues.calories !== undefined && 
                           userValues.protein !== undefined && 
                           userValues.carbs !== undefined && 
                           userValues.fat !== undefined;

  return {
    // Final nutrition values (user input takes precedence)
    calories: userValues.calories ?? aiData?.calories ?? 0,
    protein: userValues.protein ?? aiData?.protein ?? 0,
    carbs: userValues.carbs ?? aiData?.carbs ?? 0,
    fat: userValues.fat ?? aiData?.fat ?? 0,
    // Store user-provided values separately
    userCalories: userValues.calories,
    userProtein: userValues.protein,
    userCarbs: userValues.carbs,
    userFat: userValues.fat,
    // Whether AI estimation is needed
    needsAiEstimation: !hasAllUserValues,
    // Validation results
    validationErrors: errors,
    isValid: errors.length === 0,
  };
};
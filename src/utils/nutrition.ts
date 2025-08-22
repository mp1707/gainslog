import { UserSettings, DailyTargets } from "@/types";

/**
 * Nutrition calculation utilities
 */

/**
 * Calculates Base Metabolic Rate using Mifflin-St Jeor formula
 */
export const calculateBMR = (settings: UserSettings): number => {
  const { weight, height, age, sex } = settings;

  if (sex === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Activity level multipliers for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Heavy exercise 6-7 days/week
  veryactive: 1.9, // Very heavy physical job or 2x training
} as const;

/**
 * Calculates Total Daily Energy Expenditure
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: UserSettings["activityLevel"]
): number => {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
};

/**
 * Adjusts calories based on goal type
 */
export const adjustCaloriesForGoal = (
  tdee: number,
  goalType: UserSettings["calorieGoalType"]
): number => {
  switch (goalType) {
    case "lose":
      return tdee - 500; // 500 cal deficit for ~0.5kg/week loss
    case "gain":
      return tdee + 500; // 500 cal surplus for ~0.5kg/week gain
    default:
      return tdee;
  }
};

/**
 * Calculates daily nutrition targets based on user settings
 */
export const calculateDailyTargets = (settings: UserSettings): DailyTargets => {
  const bmr = calculateBMR(settings);
  const tdee = calculateTDEE(bmr, settings.activityLevel);
  const targetCalories = adjustCaloriesForGoal(tdee, settings.calorieGoalType);

  // Calculate protein (g) = weight (kg) × proteinCalculationFactor
  const protein = settings.weight * settings.proteinCalculationFactor;

  // Calculate fat (g) = (calories × fatPercentage) / 9
  const fat = (targetCalories * settings.fatCalculationPercentage) / 100 / 9;

  // Calculate carbs (g) = remaining calories / 4
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = remainingCalories / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.round(Math.max(0, carbs)), // Ensure non-negative
    fat: Math.round(fat),
  };
};

/**
 * Validates if nutrition values are reasonable
 */
export const validateNutritionValues = (values: {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (values.calories !== undefined) {
    if (values.calories < 0) errors.push("Calories cannot be negative");
    if (values.calories > 10000) errors.push("Calories seem unreasonably high");
  }

  if (values.protein !== undefined) {
    if (values.protein < 0) errors.push("Protein cannot be negative");
    if (values.protein > 500) errors.push("Protein seems unreasonably high");
  }

  if (values.carbs !== undefined) {
    if (values.carbs < 0) errors.push("Carbs cannot be negative");
    if (values.carbs > 1000) errors.push("Carbs seem unreasonably high");
  }

  if (values.fat !== undefined) {
    if (values.fat < 0) errors.push("Fat cannot be negative");
    if (values.fat > 500) errors.push("Fat seems unreasonably high");
  }

  // Check if macros roughly match calories (within 20% tolerance)
  if (values.calories && values.protein && values.carbs && values.fat) {
    const calculatedCalories =
      values.protein * 4 + values.carbs * 4 + values.fat * 9;
    const difference = Math.abs(calculatedCalories - values.calories);
    const tolerance = values.calories * 0.2;

    if (difference > tolerance) {
      errors.push("Macro calories don't match total calories");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Formats a number as a nutrient value (e.g., "25g", "1,234 cal")
 */
export const formatNutrientValue = (
  value: number,
  type: "calories" | "protein" | "carbs" | "fat"
): string => {
  const rounded = Math.round(value);

  if (type === "calories") {
    return `${rounded.toLocaleString()} cal`;
  }

  return `${rounded}g`;
};

/**
 * Calculates the percentage of daily target
 */
export const calculatePercentage = (actual: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((actual / target) * 100);
};

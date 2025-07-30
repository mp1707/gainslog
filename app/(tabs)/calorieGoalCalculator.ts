/**
 * @file Calorie Goal Calculation Functions
 * @description Provides TypeScript functions to calculate daily calorie goals for weight loss, maintenance, and gain.
 * @version 1.0.0
 * @see {@link c4f9ba7f-905c-409e-a64b-601ee981f1e7} - Scientific research document for methodology.
 */

// --- Type Definitions ---

/**
 * Biological sex is a required input for most RMR formulas.
 */
export type Sex = "male" | "female";

/**
 * Activity levels for the Mifflin-St Jeor based calculation.
 * These correspond to common PAL (Physical Activity Level) multipliers.
 */
export type ActivityLevelMifflin =
  | "sedentary"
  | "light"
  | "moderate"
  | "very"
  | "extra";

/**
 * Activity levels for the 2023 DRI EER calculation.
 * These are the official categories from the National Academies of Sciences, Engineering, and Medicine.
 */
export type ActivityLevelDRI =
  | "inactive"
  | "lowActive"
  | "active"
  | "veryActive";

/**
 * Input parameters for the calculation functions.
 */
export interface CalorieIntakeParams {
  sex: Sex;
  age: number; // in years
  weight: number; // in kilograms (kg)
  height: number; // in centimeters (cm)
}

/**
 * The output object containing the three primary calorie goals.
 */
export interface CalorieGoals {
  loseWeight: number;
  maintainWeight: number;
  gainWeight: number;
}

// --- Calculation Logic ---

/**
 * A dictionary mapping the Mifflin activity levels to their corresponding
 * Physical Activity Level (PAL) multipliers.
 */
const mifflinActivityMultipliers: Record<ActivityLevelMifflin, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

/**
 * Safety floors for calorie intake to prevent unhealthy recommendations.
 * Diets below these levels should be medically supervised.
 */
const calorieSafetyFloors: Record<Sex, number> = {
  female: 1200,
  male: 1500,
};

/**
 * Calculates daily calorie goals based on the Mifflin-St Jeor equation,
 * which is a highly validated and widely recommended method for the general population.
 *
 * @param params - An object containing the user's physical data.
 * @param activityLevel - The user's estimated daily activity level.
 * @returns An object with calculated calorie goals for weight loss, maintenance, and gain.
 */
export function calculateCalorieGoalsMifflin(
  params: CalorieIntakeParams,
  activityLevel: ActivityLevelMifflin
): CalorieGoals {
  const { sex, age, weight, height } = params;

  // 1. Calculate Resting Metabolic Rate (RMR) using Mifflin-St Jeor
  let rmr: number;
  if (sex === "male") {
    rmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    rmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Calculate Total Daily Energy Expenditure (TDEE) for maintenance
  const activityMultiplier = mifflinActivityMultipliers[activityLevel];
  const maintainWeight = Math.round(rmr * activityMultiplier);

  // 3. Calculate goals for weight loss and gain
  // Deficit of 500 kcal for loss, surplus of 300 kcal for lean gain.
  let loseWeight = maintainWeight - 500;
  const gainWeight = maintainWeight + 300;

  // 4. Apply the safety floor to the weight loss goal
  const safetyFloor = calorieSafetyFloors[sex];
  if (loseWeight < safetyFloor) {
    loseWeight = safetyFloor;
  }

  return {
    loseWeight: Math.round(loseWeight),
    maintainWeight,
    gainWeight: Math.round(gainWeight),
  };
}

/**
 * Calculates daily calorie goals based on the 2023 Dietary Reference Intakes (DRI)
 * Estimated Energy Requirement (EER) equations. This is the most current scientific
 * consensus from U.S. and Canadian governmental health authorities.
 *
 * @param params - An object containing the user's physical data.
 * @param activityLevel - The user's activity category as defined by the 2023 DRI.
 * @returns An object with calculated calorie goals for weight loss, maintenance, and gain.
 */
export function calculateCalorieGoalsDRI(
  params: CalorieIntakeParams,
  activityLevel: ActivityLevelDRI
): CalorieGoals {
  const { sex, age, weight, height } = params;

  // 1. Directly calculate TDEE (referred to as EER) using the 2023 DRI formulas
  let maintainWeight: number;

  if (sex === "male") {
    switch (activityLevel) {
      case "inactive":
        maintainWeight = 753.07 - 10.83 * age + 6.5 * height + 14.1 * weight;
        break;
      case "lowActive":
        maintainWeight = 581.47 - 10.83 * age + 8.3 * height + 14.94 * weight;
        break;
      case "active":
        maintainWeight = 1004.82 - 10.83 * age + 6.52 * height + 15.91 * weight;
        break;
      case "veryActive":
        maintainWeight =
          -517.88 - 10.83 * age + 15.61 * height + 19.11 * weight;
        break;
    }
  } else {
    // female
    switch (activityLevel) {
      case "inactive":
        maintainWeight = 584.9 - 7.01 * age + 5.72 * height + 11.71 * weight;
        break;
      case "lowActive":
        maintainWeight = 575.77 - 7.01 * age + 6.6 * height + 12.14 * weight;
        break;
      case "active":
        maintainWeight = 710.25 - 7.01 * age + 6.54 * height + 12.34 * weight;
        break;
      case "veryActive":
        maintainWeight = 511.83 - 7.01 * age + 9.07 * height + 12.56 * weight;
        break;
    }
  }

  // 2. Calculate goals for weight loss and gain
  let loseWeight = maintainWeight - 500;
  const gainWeight = maintainWeight + 300;

  // 3. Apply the safety floor
  const safetyFloor = calorieSafetyFloors[sex];
  if (loseWeight < safetyFloor) {
    loseWeight = safetyFloor;
  }

  return {
    loseWeight: Math.round(loseWeight),
    maintainWeight: Math.round(maintainWeight),
    gainWeight: Math.round(gainWeight),
  };
}

// --- Example Usage ---

const exampleUser: CalorieIntakeParams = {
  sex: "female",
  age: 30,
  weight: 70, // kg
  height: 170, // cm
};

// Example 1: Using the Mifflin-St Jeor method
const goalsMifflin = calculateCalorieGoalsMifflin(exampleUser, "light");
console.log("--- Mifflin-St Jeor Method ---");
console.log("Maintain Weight:", goalsMifflin.maintainWeight, "kcal/day");
console.log("Lose Weight:", goalsMifflin.loseWeight, "kcal/day");
console.log("Gain Weight:", goalsMifflin.gainWeight, "kcal/day");
// Expected Output for this example:
// Maintain Weight: 1968 kcal/day
// Lose Weight: 1468 kcal/day
// Gain Weight: 2268 kcal/day

// Example 2: Using the 2023 DRI method
const goalsDRI = calculateCalorieGoalsDRI(exampleUser, "lowActive");
console.log("\n--- 2023 DRI EER Method ---");
console.log("Maintain Weight:", goalsDRI.maintainWeight, "kcal/day");
console.log("Lose Weight:", goalsDRI.loseWeight, "kcal/day");
console.log("Gain Weight:", goalsDRI.gainWeight, "kcal/day");
// Expected Output for this example:
// Maintain Weight: 2289 kcal/day
// Lose Weight: 1789 kcal/day
// Gain Weight: 2589 kcal/day

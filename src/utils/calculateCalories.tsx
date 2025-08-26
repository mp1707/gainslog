import type {
  UserSettings,
} from "@/types/models";

// --- Calculation Logic ---

/**
 * A dictionary mapping the activity levels to their corresponding
 * Physical Activity Level (PAL) multipliers.
 */
const activityMultipliers: Record<UserSettings["activityLevel"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryactive: 1.9,
};

/**
 * Safety floors for calorie intake to prevent unhealthy recommendations.
 * Diets below these levels should be medically supervised.
 */
const calorieSafetyFloors: Record<UserSettings["sex"], number> = {
  female: 1200,
  male: 1500,
};

/**
 * Calculates daily calorie goals based on the Mifflin-St Jeor equation.
 *
 * @param params - An object containing the user's physical data (sex, age, weight, height).
 * @param activityLevel - The user's estimated daily activity level.
 * @returns An object with calculated calorie goals for weight loss, maintenance, and gain.
 */
export function calculateCalorieGoals(
  params: UserSettings,
  activityLevel: UserSettings["activityLevel"]
): {
  loseWeight: number;
  maintainWeight: number;
  gainWeight: number;
} {
  const { sex, age, weight, height } = params;

  if (!sex) {
    throw new Error("Sex parameter is required for calorie calculation");
  }

  // 1. Calculate Resting Metabolic Rate (RMR) using Mifflin-St Jeor
  let rmr: number;
  if (sex === "male") {
    // Formula for males
    rmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Formula for females
    rmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Calculate Total Daily Energy Expenditure (TDEE) for maintenance
  const activityMultiplier = activityMultipliers[activityLevel];
  const maintainWeight = Math.round(rmr * activityMultiplier);

  // 3. Calculate goals for weight loss and gain
  // A standard, safe deficit of 500 kcal for loss and a modest surplus of 300 kcal for lean gain.
  let loseWeight = maintainWeight - 500;
  const gainWeight = maintainWeight + 300;

  // 4. Apply the safety floor to the weight loss goal to prevent unsafe targets
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

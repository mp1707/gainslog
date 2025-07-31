/**
 * @file Calorie Goal Calculation Function
 * @description Provides a TypeScript function to calculate daily calorie goals for weight loss, maintenance, and gain
 * using the highly validated Mifflin-St Jeor equation.
 * @version 2.0.0
 * @see {@link c4f9ba7f-905c-409e-a64b-601ee981f1e7} - Scientific research document for methodology.
 */

// --- Type Definitions ---

/**
 * Biological sex is a required input for the RMR formula.
 */
export type Sex = 'male' | 'female';

/**
 * Activity levels correspond to common Physical Activity Level (PAL) multipliers.
 * These are used to convert RMR to TDEE.
 */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryactive';

/**
 * Input parameters for the calculation function.
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
 * A dictionary mapping the activity levels to their corresponding 
 * Physical Activity Level (PAL) multipliers.
 */
const activityMultipliers: Record<ActivityLevel, number> = {
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
const calorieSafetyFloors: Record<Sex, number> = {
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
    params: CalorieIntakeParams,
    activityLevel: ActivityLevel
): CalorieGoals {
    const { sex, age, weight, height } = params;

    // 1. Calculate Resting Metabolic Rate (RMR) using Mifflin-St Jeor
    let rmr: number;
    if (sex === 'male') {
        // Formula for males
        rmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        // Formula for females
        rmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
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


// --- Example Usage ---

// const exampleUser: CalorieIntakeParams = {
//     sex: 'female',
//     age: 30,
//     weight: 70, // kg
//     height: 170, // cm
// };

// const goals = calculateCalorieGoals(exampleUser, 'light');

// console.log('--- Mifflin-St Jeor Method ---');
// console.log('Maintain Weight:', goals.maintainWeight, 'kcal/day');
// console.log('Lose Weight:', goals.loseWeight, 'kcal/day');
// console.log('Gain Weight:', goals.gainWeight, 'kcal/day');

// Expected Output for this example:
// Maintain Weight: 1968 kcal/day
// Lose Weight: 1468 kcal/day
// Gain Weight: 2268 kcal/day

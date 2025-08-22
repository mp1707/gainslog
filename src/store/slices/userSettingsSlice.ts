import { StateCreator } from "zustand";
import { UserSettings, DailyTargets } from "@/types";

export interface UserSettingsSlice {
  userSettings: UserSettings | null;
  dailyTargets: DailyTargets | null;

  updateUserSettings: (settings: Partial<UserSettings>) => void;
  calculateAndSetTargets: () => void;
}

const calculateDailyTargets = (settings: UserSettings): DailyTargets => {
  // Base Metabolic Rate (BMR) calculation using Mifflin-St Jeor formula
  let bmr: number;
  if (settings.sex === "male") {
    bmr = 10 * settings.weight + 6.25 * settings.height - 5 * settings.age + 5;
  } else {
    bmr =
      10 * settings.weight + 6.25 * settings.height - 5 * settings.age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryactive: 1.9,
  };

  // Total Daily Energy Expenditure (TDEE)
  const tdee = bmr * activityMultipliers[settings.activityLevel];

  // Adjust for goal
  let targetCalories: number;
  switch (settings.calorieGoalType) {
    case "lose":
      targetCalories = tdee - 500; // 500 cal deficit for ~0.5kg/week loss
      break;
    case "gain":
      targetCalories = tdee + 500; // 500 cal surplus for ~0.5kg/week gain
      break;
    default:
      targetCalories = tdee;
  }

  // Calculate macros
  const protein = settings.weight * settings.proteinCalculationFactor;
  const fat = (targetCalories * settings.fatCalculationPercentage) / 100 / 9; // 9 cal per gram of fat
  const carbs = (targetCalories - protein * 4 - fat * 9) / 4; // 4 cal per gram of carbs/protein

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
};

export const createUserSettingsSlice: StateCreator<
  UserSettingsSlice,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  UserSettingsSlice
> = (set, get) => ({
  userSettings: null,
  dailyTargets: null,

  updateUserSettings: (settings) =>
    set((state) => {
      if (!state.userSettings) {
        state.userSettings = settings as UserSettings;
      } else {
        Object.assign(state.userSettings, settings);
      }
    }),

  calculateAndSetTargets: () => {
    const { userSettings } = get();
    if (!userSettings) return;

    const targets = calculateDailyTargets(userSettings);

    set((state) => {
      state.dailyTargets = targets;
    });
  },
});

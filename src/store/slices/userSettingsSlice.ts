import { StateCreator } from "zustand";
import { UserSettings, DailyTargets } from "@/types";

export interface UserSettingsSlice {
  userSettings: UserSettings | null;
  dailyTargets: DailyTargets | null;

  updateUserSettings: (settings: Partial<UserSettings>) => void;
  calculateAndSetTargets: () => void;
  setDailyTargets: (targets: Partial<DailyTargets>) => void;
  resetDailyTargets: () => void;
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
  const protein = settings.weight * (settings.proteinCalculationFactor || 2.2);
  const fatPercentage = settings.fatCalculationPercentage || 30; // Default 30% if not set
  const fat = (targetCalories * fatPercentage) / 100 / 9; // 9 cal per gram of fat
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
        // Ensure defaults are set for new user settings
        state.userSettings = {
          proteinCalculationFactor: 2.2,
          fatCalculationPercentage: 30,
          ...settings,
        } as UserSettings;
      } else {
        Object.assign(state.userSettings, settings);
      }
    }),

  calculateAndSetTargets: () => {
    const { userSettings } = get();
    if (!userSettings) return;
    // Compute complete targets from user settings so UI has carbs/fat as well
    const computed = calculateDailyTargets(userSettings);

    set((state) => {
      // If user had manually overridden any targets earlier via setDailyTargets,
      // we preserve those non-zero overrides and fill in missing values from computed.
      const existing = state.dailyTargets || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      state.dailyTargets = {
        calories: existing.calories > 0 ? existing.calories : computed.calories,
        protein: existing.protein > 0 ? existing.protein : computed.protein,
        carbs: existing.carbs > 0 ? existing.carbs : computed.carbs,
        fat: existing.fat > 0 ? existing.fat : computed.fat,
      } as DailyTargets;
    });
  },

  setDailyTargets: (targets) =>
    set((state) => {
      const current = state.dailyTargets || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      state.dailyTargets = { ...current, ...targets } as DailyTargets;
    }),

  resetDailyTargets: () =>
    set((state) => {
      // Reset daily targets to zero
      state.dailyTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      // Clear user settings to ensure UI state reflects the reset
      state.userSettings = null;
    }),
});

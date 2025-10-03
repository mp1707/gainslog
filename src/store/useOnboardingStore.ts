import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type OnboardingState = {
  // User demographic data
  age?: number;
  sex?: "male" | "female";
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "veryactive";

  // Goal data
  calorieGoalType?: "lose" | "maintain" | "gain";
  calorieGoal?: number;
  proteinGoal?: number; // g
  fatPercentage?: number; // percentage of calories

  // Skip functionality
  userSkippedOnboarding: boolean;

  // Actions
  setAge: (age: number) => void;
  setSex: (sex: "male" | "female") => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setActivityLevel: (level: "sedentary" | "light" | "moderate" | "active" | "veryactive") => void;
  setCalorieGoalType: (type: "lose" | "maintain" | "gain") => void;
  setCalorieGoal: (goal: number) => void;
  setProteinGoal: (goal: number) => void;
  setFatPercentage: (percentage: number) => void;
  setUserSkippedOnboarding: (skipped: boolean) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  immer((set) => ({
    // Initial state - all undefined
    age: undefined,
    sex: undefined,
    height: undefined,
    weight: undefined,
    activityLevel: undefined,
    calorieGoalType: undefined,
    calorieGoal: undefined,
    proteinGoal: undefined,
    fatPercentage: 20, // Default to 20%

    // Skip functionality
    userSkippedOnboarding: false,

    // Actions
    setAge: (age) =>
      set((state) => {
        state.age = age;
      }),

    setSex: (sex) =>
      set((state) => {
        state.sex = sex;
      }),

    setHeight: (height) =>
      set((state) => {
        state.height = height;
      }),

    setWeight: (weight) =>
      set((state) => {
        state.weight = weight;
      }),

    setActivityLevel: (level) =>
      set((state) => {
        state.activityLevel = level;
      }),

    setCalorieGoalType: (type) =>
      set((state) => {
        state.calorieGoalType = type;
      }),

    setCalorieGoal: (goal) =>
      set((state) => {
        state.calorieGoal = goal;
      }),

    setProteinGoal: (goal) =>
      set((state) => {
        state.proteinGoal = goal;
      }),

    setFatPercentage: (percentage) =>
      set((state) => {
        state.fatPercentage = percentage;
      }),

    setUserSkippedOnboarding: (skipped) =>
      set((state) => {
        state.userSkippedOnboarding = skipped;
      }),

    reset: () =>
      set((state) => {
        state.age = undefined;
        state.sex = undefined;
        state.height = undefined;
        state.weight = undefined;
        state.activityLevel = undefined;
        state.calorieGoalType = undefined;
        state.calorieGoal = undefined;
        state.proteinGoal = undefined;
        state.fatPercentage = 20;
        state.userSkippedOnboarding = false;
      }),
  }))
);

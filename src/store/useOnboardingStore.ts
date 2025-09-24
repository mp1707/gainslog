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
  calorieGoal?: number;
  proteinGoal?: number; // g
  fatPercentage?: number; // percentage of calories

  // Skip functionality
  userSkippedOnboarding: boolean;

  // Manual override functionality
  isManualMode: boolean;
  manualCalories?: number;
  manualProtein?: number;
  manualFat?: number;

  // Actions
  setAge: (age: number) => void;
  setSex: (sex: "male" | "female") => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setActivityLevel: (level: "sedentary" | "light" | "moderate" | "active" | "veryactive") => void;
  setCalorieGoal: (goal: number) => void;
  setProteinGoal: (goal: number) => void;
  setFatPercentage: (percentage: number) => void;
  setUserSkippedOnboarding: (skipped: boolean) => void;
  setIsManualMode: (isManual: boolean) => void;
  setManualCalories: (calories: number) => void;
  setManualProtein: (protein: number) => void;
  setManualFat: (fat: number) => void;
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
    calorieGoal: undefined,
    proteinGoal: undefined,
    fatPercentage: 30, // Default to 30%

    // Skip functionality
    userSkippedOnboarding: false,

    // Manual override functionality
    isManualMode: false,
    manualCalories: undefined,
    manualProtein: undefined,
    manualFat: undefined,

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

    setIsManualMode: (isManual) =>
      set((state) => {
        state.isManualMode = isManual;
      }),

    setManualCalories: (calories) =>
      set((state) => {
        state.manualCalories = calories;
      }),

    setManualProtein: (protein) =>
      set((state) => {
        state.manualProtein = protein;
      }),

    setManualFat: (fat) =>
      set((state) => {
        state.manualFat = fat;
      }),

    reset: () =>
      set((state) => {
        state.age = undefined;
        state.sex = undefined;
        state.height = undefined;
        state.weight = undefined;
        state.activityLevel = undefined;
        state.calorieGoal = undefined;
        state.proteinGoal = undefined;
        state.fatPercentage = 30;
        state.userSkippedOnboarding = false;
        state.isManualMode = false;
        state.manualCalories = undefined;
        state.manualProtein = undefined;
        state.manualFat = undefined;
      }),
  }))
);
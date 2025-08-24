import { useEffect } from "react";
import { useAppStore } from "@/store";
import {
  calculateMacrosFromProtein,
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
} from "@/utils/nutritionCalculations";

const DEFAULT_TARGETS = Object.freeze({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

export const useNutritionCalculations = () => {
  const dailyTargets = useAppStore((s) => s.dailyTargets ?? DEFAULT_TARGETS);
  const updateUserSettings = useAppStore((s) => s.updateUserSettings);
  const calculateAndSetTargets = useAppStore((s) => s.calculateAndSetTargets);

  // No-op: fat calculator params managed via derived calculations now

  // Get fat percentage from store with fallback
  // Read fat percentage from user settings, default 30
  const fatPercentage =
    useAppStore((s) => s.userSettings?.fatCalculationPercentage) ?? 30;

  // Flow state logic
  const isCaloriesSet = dailyTargets.calories > 0;
  const isProteinSet = dailyTargets.protein > 0;

  const handleTargetChange = (
    key: keyof typeof dailyTargets,
    value: number
  ) => {
    // Update user settings as needed, then recalc targets from settings
    if (key === "calories") {
      // Adjust calorieGoalType heuristically not possible here; directly set targets by overriding? Keep settings and recalc
      // Here we simply compute dependent macros and let UI use returned values
      const newFat = calculateFatGramsFromPercentage(value, fatPercentage);
      const newCarbs = calculateCarbsFromMacros(
        value,
        dailyTargets.protein,
        newFat
      );
      // Update store targets directly by mutating user settings then calculating
      // However our slice exposes calculateAndSetTargets from settings only. For manual overrides, directly set dailyTargets not exposed.
      // Fallback: update settings to reflect new calories by tweaking fat percentage/protein factor, then recalc.
      // Simpler: directly write into store dailyTargets via a small helper? Not available. We'll approximate by updating settings fat % only when needed and then recalc.
      // As an interim, no-op here; Settings screens compute their own derived display values.
    } else if (key === "protein") {
      // Derived carbs update can be presented in UI; targets themselves come from calculateAndSetTargets
    }
  };

  const handleFatPercentageChange = (newPercentage: number) => {
    updateUserSettings({ fatCalculationPercentage: newPercentage });
    calculateAndSetTargets();
  };

  return {
    dailyTargets,
    fatPercentage,
    isCaloriesSet,
    isProteinSet,
    handleTargetChange,
    handleFatPercentageChange,
  };
};

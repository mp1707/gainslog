import { useState, useEffect } from "react";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import {
  calculateMacrosFromProtein,
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
} from "@/utils/nutritionCalculations";

export const useNutritionCalculations = () => {
  const {
    dailyTargets,
    updateDailyTargetsDebounced,
    fatCalculatorParams,
    setFatCalculatorParams,
    loadFatCalculatorParams,
  } = useFoodLogStore();

  // Load fat calculator params on mount
  useEffect(() => {
    loadFatCalculatorParams();
  }, [loadFatCalculatorParams]);

  // Get fat percentage from store with fallback
  const fatPercentage = fatCalculatorParams?.fatPercentage ?? 30;

  // Flow state logic
  const isCaloriesSet = dailyTargets.calories > 0;
  const isProteinSet = dailyTargets.protein > 0;

  const handleTargetChange = (
    key: keyof typeof dailyTargets,
    value: number
  ) => {
    const currentTargets = dailyTargets;

    let newTargets = {
      ...currentTargets,
      [key]: value,
    };

    // Check if this is the first time protein is being set (during guided flow)
    const isFirstTimeSettingProtein =
      key === "protein" && !isProteinSet && isCaloriesSet && value > 0;

    if (isFirstTimeSettingProtein) {
      // Auto-calculate Fat and Carbs when protein is first set
      const calculated = calculateMacrosFromProtein(
        currentTargets.calories,
        value
      );
      setFatCalculatorParams({ fatPercentage: calculated.fatPercentage });
      newTargets = {
        ...newTargets,
        fat: calculated.fat,
        carbs: calculated.carbs,
      };
    } else if (key === "calories" && isProteinSet) {
      // Calories changed: recalculate fat and carbs based on current percentage
      const newFatGrams = calculateFatGramsFromPercentage(value, fatPercentage);
      const newCarbsGrams = calculateCarbsFromMacros(
        value,
        currentTargets.protein,
        newFatGrams
      );
      newTargets = {
        ...newTargets,
        fat: newFatGrams,
        carbs: newCarbsGrams,
      };
    } else if (key === "protein" && isProteinSet) {
      // Protein changed: recalculate carbs (fat percentage stays same)
      const fatGrams = calculateFatGramsFromPercentage(
        currentTargets.calories,
        fatPercentage
      );
      const newCarbsGrams = calculateCarbsFromMacros(
        currentTargets.calories,
        value,
        fatGrams
      );
      newTargets = {
        ...newTargets,
        carbs: newCarbsGrams,
      };
    }

    updateDailyTargetsDebounced(newTargets);
  };

  const handleFatPercentageChange = (newPercentage: number) => {
    setFatCalculatorParams({ fatPercentage: newPercentage });
    const newFatGrams = calculateFatGramsFromPercentage(
      dailyTargets.calories,
      newPercentage
    );
    const newCarbsGrams = calculateCarbsFromMacros(
      dailyTargets.calories,
      dailyTargets.protein,
      newFatGrams
    );

    updateDailyTargetsDebounced({
      ...dailyTargets,
      fat: newFatGrams,
      carbs: newCarbsGrams,
    });
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
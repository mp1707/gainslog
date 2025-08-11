import { useState } from "react";
import { Alert } from "react-native";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProteinCalculationMethod } from "@/shared/ui/atoms/ProteinCalculationCard";
import { CALCULATION_METHODS } from "@/shared/ui/atoms/CalorieCalculationCard";
import { GoalType } from "@/shared/ui/atoms/GoalSelectionCard";
import {
  CalorieIntakeParams,
  ActivityLevel,
} from "@/utils/calculateCalories";

export const useSettingsModals = (
  onTargetChange: (key: "calories" | "protein", value: number) => void,
  onCalorieCalculatorComplete?: () => void,
  onProteinCalculatorComplete?: () => void
) => {
  const {
    proteinCalculation,
    setProteinCalculation,
    calorieCalculation,
    setCalorieCalculation,
    resetDailyTargets,
  } = useFoodLogStore();

  const [isProteinCalculatorVisible, setIsProteinCalculatorVisible] =
    useState(false);
  const [isCalorieCalculatorVisible, setIsCalorieCalculatorVisible] =
    useState(false);

  const handleProteinCalculationSelect = (
    method: ProteinCalculationMethod,
    bodyWeight: number,
    calculatedProtein: number
  ) => {
    setProteinCalculation(method, bodyWeight, calculatedProtein);
    onTargetChange("protein", calculatedProtein);
    onProteinCalculatorComplete?.();
  };

  const handleCalorieGoalSelect = (
    goalType: GoalType,
    calories: number,
    params: CalorieIntakeParams,
    activityLevel: ActivityLevel
  ) => {
    // Create method object from activity level for store compatibility
    const method = CALCULATION_METHODS[activityLevel];

    // Store the calorie calculation in the store
    setCalorieCalculation(method, params, activityLevel, calories, goalType);

    // Update the calorie target based on selected goal
    onTargetChange("calories", calories);
    onCalorieCalculatorComplete?.();
  };

  const handleResetTargets = () => {
    Alert.alert(
      "Reset Daily Targets",
      "This will reset all your daily nutrition targets to zero and clear any saved calculations. This action cannot be undone.\\n\\nAre you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetDailyTargets();
              Alert.alert(
                "Success",
                "Daily targets have been reset successfully."
              );
            } catch (error) {
              // Error is already handled in the store
            }
          },
        },
      ]
    );
  };

  return {
    // Modal visibility state
    isProteinCalculatorVisible,
    setIsProteinCalculatorVisible,
    isCalorieCalculatorVisible,
    setIsCalorieCalculatorVisible,
    // Calculation data
    proteinCalculation,
    calorieCalculation,
    // Event handlers
    handleProteinCalculationSelect,
    handleCalorieGoalSelect,
    handleResetTargets,
  };
};
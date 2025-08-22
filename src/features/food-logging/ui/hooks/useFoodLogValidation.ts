import { Alert } from "react-native";
import { LegacyFoodLog, ModalMode } from "@/types/indexLegacy";
import { mergeNutritionData } from "@/features/food-logging/utils";
import { useFoodLogStore, selectSelectedDate } from "src/stores/useFoodLogStore";
import { FoodLogFormData } from "./useFoodLogForm";

export interface UseFoodLogValidationReturn {
  validateAndCreateLog: (
    formData: FoodLogFormData,
    currentLog: LegacyFoodLog | null,
    mode: ModalMode
  ) => { isValid: boolean; log?: LegacyFoodLog; error?: string };
}

/**
 * Custom hook for validating food log data and creating final log objects
 * Handles validation logic and final log construction based on mode
 */
export function useFoodLogValidation(): UseFoodLogValidationReturn {
  const selectedDate = useFoodLogStore(selectSelectedDate);

  const validateAndCreateLog = (
    formData: FoodLogFormData,
    currentLog: LegacyFoodLog | null,
    mode: ModalMode
  ): { isValid: boolean; log?: LegacyFoodLog; error?: string } => {
    const { title, description, calories, protein, carbs, fat } = formData;

    // Validate required fields for create mode - either title OR description needed for non-image logs
    const isImageLog = currentLog?.imageUrl || currentLog?.localImageUri;
    if (
      mode === "create" &&
      !isImageLog &&
      !title.trim() &&
      !description.trim()
    ) {
      return {
        isValid: false,
        error:
          "Please provide either a title or description for your food log.",
      };
    }

    // Get nutrition data from user input and determine if AI estimation is needed
    const nutritionData = mergeNutritionData(calories, protein, carbs, fat);

    // Validate nutrition input
    if (!nutritionData.isValid) {
      Alert.alert(
        "Validation Error",
        nutritionData.validationErrors.join("\n")
      );
      return { isValid: false };
    }

    let finalLog: LegacyFoodLog;

    if (mode === "edit" && currentLog) {
      // Updating existing log - preserve original ID and metadata
      finalLog = {
        ...currentLog,
        userTitle: title.trim() || undefined,
        userDescription: description.trim() || undefined,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        needsAiEstimation: nutritionData.needsAiEstimation,
        // Reset confidence to trigger re-estimation
        estimationConfidence: nutritionData.needsAiEstimation ? 0 : 100,
      };
    } else if (mode === "create" && currentLog) {
      // Processing existing log (image log) - return log with user input for AI processing
      finalLog = {
        ...currentLog,
        userTitle: title.trim() || undefined,
        userDescription: description.trim() || undefined,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        needsAiEstimation: nutritionData.needsAiEstimation,
      };
    } else {
      // Creating completely new log (manual entry) using selected date
      const newId = `food_log_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      finalLog = {
        id: newId,
        generatedTitle: title.trim() || "Manual entry",
        estimationConfidence: nutritionData.needsAiEstimation ? 0 : 100,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userTitle: title.trim() || undefined,
        userDescription: description.trim() || undefined,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        createdAt: new Date().toISOString(),
        date: selectedDate,
        needsAiEstimation: nutritionData.needsAiEstimation,
      };
    }

    return { isValid: true, log: finalLog };
  };

  return {
    validateAndCreateLog,
  };
}

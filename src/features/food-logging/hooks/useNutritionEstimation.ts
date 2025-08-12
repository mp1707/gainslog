import {
  estimateNutritionTextBased,
  estimateNutritionImageBased,
} from "@/lib/supabase";
import { mergeNutritionData } from "../utils";
import { FoodLog } from "@/types";
import * as Haptics from "expo-haptics";

export interface UseNutritionEstimationReturn {
  processLogWithEstimation: (
    log: FoodLog,
    onSkeletonUpdate: (log: FoodLog) => void,
    onFinalUpdate: (log: FoodLog) => void,
    onInvalidImage?: (logId: string) => void
  ) => Promise<void>;
}

/**
 * Custom hook for handling nutrition estimation logic
 * Extracts complex AI estimation and data merging from App.tsx
 */
export function useNutritionEstimation(): UseNutritionEstimationReturn {
  const processLogWithEstimation = async (
    log: FoodLog,
    onSkeletonUpdate: (log: FoodLog) => void,
    onFinalUpdate: (log: FoodLog) => void,
    onInvalidImage?: (logId: string) => void
  ) => {
    if (!log.needsAiEstimation) {
      // No AI needed, just process the log
      const finalLog = { ...log, needsAiEstimation: undefined };
      onFinalUpdate(finalLog);
      return;
    }

    // Show skeleton state while processing
    const skeletonLog = {
      ...log,
      generatedTitle: log.imageUrl ? "Processing image..." : log.generatedTitle,
      estimationConfidence: 0,
    };
    onSkeletonUpdate(skeletonLog);

    try {
      let estimation;

      if (log.imageUrl) {
        // Use image-based estimation
        estimation = await estimateNutritionImageBased({
          imageUrl: log.imageUrl,
          title: log.userTitle || undefined,
          description: log.userDescription || undefined,
        });
      } else {
        // Use text-based estimation
        estimation = await estimateNutritionTextBased({
          title: log.userTitle || log.generatedTitle,
          description: log.userDescription || undefined,
        });
      }

      // Check if the AI returned an invalid image response
      if (estimation.generatedTitle === "Invalid Image" && onInvalidImage) {
        // Handle invalid image by removing skeleton and showing toast
        onInvalidImage(log.id);
        return;
      }

      // Merge AI data with user input (user input takes precedence)
      const mergedNutrition = mergeNutritionData(
        log.userCalories?.toString() || "",
        log.userProtein?.toString() || "",
        log.userCarbs?.toString() || "",
        log.userFat?.toString() || "",
        estimation
      );

      const finalLog = {
        ...log,
        generatedTitle: log.userTitle || estimation.generatedTitle,
        estimationConfidence: estimation.estimationConfidence,
        calories: mergedNutrition.calories,
        protein: mergedNutrition.protein,
        carbs: mergedNutrition.carbs,
        fat: mergedNutrition.fat,
        userCalories: mergedNutrition.userCalories,
        userProtein: mergedNutrition.userProtein,
        userCarbs: mergedNutrition.userCarbs,
        userFat: mergedNutrition.userFat,
        needsAiEstimation: undefined,
      };

      // Provide haptic feedback when estimation completes successfully
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onFinalUpdate(finalLog);
    } catch (error) {
      console.error("Error with AI estimation:", error);
      // If AI fails, just save with user data
      const fallbackLog = { ...log, needsAiEstimation: undefined };
      onFinalUpdate(fallbackLog);
    }
  };

  return {
    processLogWithEstimation,
  };
}

import {
  estimateNutritionTextBased,
  estimateNutritionImageBased,
} from "@/lib/supabase";
import { FoodLog } from "@/types";
import * as Haptics from "expo-haptics";
import { validateNutritionValues } from "@/utils/nutrition";

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
    // Legacy flag support: treat a truthy needsAiEstimation as requiring estimation
    if (!(log as any).needsAiEstimation) {
      const finalLog = { ...log, needsAiEstimation: undefined } as FoodLog & {
        needsAiEstimation?: undefined;
      };
      onFinalUpdate(finalLog);
      return;
    }

    const skeletonLog: FoodLog = {
      ...log,
      generatedTitle: log.imageUrl ? "Processing image..." : log.generatedTitle,
      estimationConfidence: 0,
    };
    onSkeletonUpdate(skeletonLog);

    try {
      let estimation: {
        generatedTitle: string;
        estimationConfidence: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };

      if (log.imageUrl) {
        estimation = await estimateNutritionImageBased({
          imageUrl: log.imageUrl,
          title: log.userTitle || undefined,
          description: log.userDescription || undefined,
        });
      } else {
        estimation = await estimateNutritionTextBased({
          title: log.userTitle || log.generatedTitle,
          description: log.userDescription || undefined,
        });
      }

      if (estimation.generatedTitle === "Invalid Image" && onInvalidImage) {
        onInvalidImage(log.id);
        return;
      }

      // Merge: prefer user-entered macros; fallback to AI-generated
      const merged = {
        calories: log.userCalories ?? estimation.calories,
        protein: log.userProtein ?? estimation.protein,
        carbs: log.userCarbs ?? estimation.carbs,
        fat: log.userFat ?? estimation.fat,
      };

      const validation = validateNutritionValues(merged);
      if (!validation.isValid) {
        merged.calories = Math.max(0, merged.calories || 0);
        merged.protein = Math.max(0, merged.protein || 0);
        merged.carbs = Math.max(0, merged.carbs || 0);
        merged.fat = Math.max(0, merged.fat || 0);
      }

      const finalLog: FoodLog = {
        ...log,
        generatedTitle: log.userTitle || estimation.generatedTitle,
        estimationConfidence: estimation.estimationConfidence,
        generatedCalories:
          log.userCalories === undefined
            ? merged.calories
            : log.generatedCalories,
        generatedProtein:
          log.userProtein === undefined ? merged.protein : log.generatedProtein,
        generatedCarbs:
          log.userCarbs === undefined ? merged.carbs : log.generatedCarbs,
        generatedFat: log.userFat === undefined ? merged.fat : log.generatedFat,
        userCalories: log.userCalories,
        userProtein: log.userProtein,
        userCarbs: log.userCarbs,
        userFat: log.userFat,
        needsAiEstimation: undefined,
      };

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onFinalUpdate(finalLog);
    } catch (error) {
      console.error("Error with AI estimation:", error);
      const fallbackLog = {
        ...log,
        needsAiEstimation: undefined,
      } as FoodLog & {
        needsAiEstimation?: undefined;
      };
      onFinalUpdate(fallbackLog);
    }
  };

  return {
    processLogWithEstimation,
  };
}

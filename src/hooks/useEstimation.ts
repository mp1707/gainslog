import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  EstimationInput,
  createEstimationLog,
  applyEstimationResults,
  EstimationResult,
} from "@/utils/estimation";
import { FoodLog } from "@/types/models";
import {
  estimateNutritionDescriptionBased,
  estimateNutritionImageBased,
} from "../lib";

export const useEstimation = () => {
  const { addFoodLog, updateFoodLog, deleteFoodLog } = useAppStore();

  const startEstimation = useCallback(
    async (logData: EstimationInput) => {
      const incompleteLog = createEstimationLog(logData);
      addFoodLog(incompleteLog);

      const isImageEstimation =
        logData.supabaseImagePath && logData.supabaseImagePath !== "";

      const estimationFunction = isImageEstimation
        ? () =>
            estimateNutritionImageBased({
              imagePath: logData.supabaseImagePath || "",
              description: logData.description || "",
            })
        : () =>
            estimateNutritionDescriptionBased({
              description: logData.description || "",
            });

      try {
        const estimationResults = await estimationFunction();
        const completedLog = applyEstimationResults(
          incompleteLog,
          estimationResults
        );

        updateFoodLog(incompleteLog.id, {
          title: completedLog.title,
          calories: completedLog.calories,
          protein: completedLog.protein,
          carbs: completedLog.carbs,
          fat: completedLog.fat,
          localImagePath: logData.localImagePath,
          estimationConfidence: completedLog.estimationConfidence,
          isEstimating: false,
        });
      } catch (error) {
        deleteFoodLog(incompleteLog.id);
      }
    },
    [addFoodLog, updateFoodLog, deleteFoodLog]
  );

  const startReEstimation = useCallback(
    async (logData: FoodLog, onComplete: (log: FoodLog) => void) => {
      updateFoodLog(logData.id, { isEstimating: true });
      let estimationResults: EstimationResult;
      if (!logData.supabaseImagePath || logData.supabaseImagePath === "") {
        estimationResults = await estimateNutritionDescriptionBased({
          description: logData.description || "",
        });
      } else {
        estimationResults = await estimateNutritionImageBased({
          imagePath: logData.supabaseImagePath,
          description: logData.description || "",
        });
      }
      const title =
        logData.title !== undefined && logData.title !== ""
          ? logData.title
          : estimationResults.generatedTitle;
      const completedLog: FoodLog = {
        ...logData,
        title: title,
        description: logData.description || "",
        supabaseImagePath: logData.supabaseImagePath || "",
        calories: estimationResults.calories,
        protein: estimationResults.protein,
        carbs: estimationResults.carbs,
        fat: estimationResults.fat,
        estimationConfidence: estimationResults.estimationConfidence,
        isEstimating: false,
      };
      updateFoodLog(logData.id, completedLog);
      onComplete(completedLog);
    },
    [addFoodLog, updateFoodLog, deleteFoodLog]
  );

  return {
    startEstimation,
    startReEstimation,
  };
};

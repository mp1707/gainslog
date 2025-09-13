import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  EstimationInput,
  createEstimationLog,
  applyEstimationResults,
} from "@/utils/estimation";
import { FoodLog } from "@/types/models";
import {
  estimateTextBased,
  estimateNutritionImageBased,
  FoodEstimateResponse,
  refineTextBased,
  refineImageBased,
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
            estimateTextBased({
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
          foodComponents: estimationResults.foodComponents,
          isEstimating: false,
        });
      } catch (error) {
        deleteFoodLog(incompleteLog.id);
      }
    },
    [addFoodLog, updateFoodLog, deleteFoodLog]
  );

  const startReEstimation = useCallback(
    async (editedLog: FoodLog, onComplete: (log: FoodLog) => void) => {
      // Do NOT mutate the store here. Only compute refined values.
      let estimationResults: FoodEstimateResponse;
      if (!editedLog.supabaseImagePath || editedLog.supabaseImagePath === "") {
        estimationResults = await refineTextBased({
          description: editedLog.description || "",
          foodComponents: editedLog.foodComponents || [],
        });
      } else {
        estimationResults = await refineImageBased({
          imagePath: editedLog.supabaseImagePath,
          description: editedLog.description || "",
          foodComponents: editedLog.foodComponents,
        });
      }
      const title =
        editedLog.title !== undefined && editedLog.title !== ""
          ? editedLog.title
          : estimationResults.generatedTitle;
      const completedLog: FoodLog = {
        ...editedLog,
        title: title,
        description: editedLog.description || "",
        supabaseImagePath: editedLog.supabaseImagePath || "",
        localImagePath: editedLog.localImagePath,
        calories: estimationResults.calories,
        protein: estimationResults.protein,
        carbs: estimationResults.carbs,
        fat: estimationResults.fat,
        estimationConfidence: estimationResults.estimationConfidence,
        foodComponents: estimationResults.foodComponents,
        isEstimating: false,
      };
      onComplete(completedLog);
    },
    []
  );

  return {
    startEstimation,
    startReEstimation,
  };
};

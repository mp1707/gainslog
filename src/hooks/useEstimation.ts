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
      updateFoodLog(editedLog.id, { isEstimating: true });
      let estimationResults: FoodEstimateResponse;
      if (!editedLog.supabaseImagePath || editedLog.supabaseImagePath === "") {
        estimationResults = await refineTextBased({
          description: editedLog.description || "",
          foodComponents: editedLog.foodComponents || [],
        });
      } else {
        estimationResults = await estimateNutritionImageBased({
          imagePath: editedLog.supabaseImagePath,
          description: editedLog.description || "",
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
      updateFoodLog(editedLog.id, completedLog);
      onComplete(completedLog);
    },
    [addFoodLog, updateFoodLog, deleteFoodLog]
  );

  return {
    startEstimation,
    startReEstimation,
  };
};

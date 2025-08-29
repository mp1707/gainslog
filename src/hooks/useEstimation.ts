import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  EstimationInput,
  createEstimationLog,
  estimateNutrition,
  applyEstimationResults,
} from "@/utils/estimation";

export const useEstimation = () => {
  const { addFoodLog, updateFoodLog, deleteFoodLog } = useAppStore();

  const startEstimation = useCallback(
    async (logData: EstimationInput) => {
      const incompleteLog = createEstimationLog(logData);
      addFoodLog(incompleteLog);

      try {
        const estimationResults = await estimateNutrition(logData);
        const completedLog = applyEstimationResults(incompleteLog, estimationResults);
        
        updateFoodLog(incompleteLog.id, {
          title: completedLog.title,
          calories: completedLog.calories,
          protein: completedLog.protein,
          carbs: completedLog.carbs,
          fat: completedLog.fat,
          estimationConfidence: completedLog.estimationConfidence,
          isEstimating: false,
        });
      } catch (error) {
        console.error("Estimation failed:", error);
        deleteFoodLog(incompleteLog.id);
      }
    },
    [addFoodLog, updateFoodLog, deleteFoodLog]
  );

  return {
    startEstimation,
  };
};
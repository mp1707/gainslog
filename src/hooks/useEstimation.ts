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

  // Unified estimation function: create flow (no callback) or edit flow (with callback)
  const runEstimation = useCallback(
    async (
      input: EstimationInput | FoodLog,
      onComplete?: (log: FoodLog) => void
    ) => {
      const isEditFlow = typeof onComplete === "function";

      if (isEditFlow) {
        // Edit flow: compute and return new values, do not touch store
        const editedLog = input as FoodLog;

        const hasComponents = (editedLog.foodComponents?.length || 0) > 0;
        const hasImage =
          !!editedLog.supabaseImagePath && editedLog.supabaseImagePath !== "";

        let estimationResults: FoodEstimateResponse;
        if (!hasComponents) {
          // No precise components => run initial estimation instead of refine
          if (hasImage) {
            console.log('🖼️ Image initial estimation');
            estimationResults = await estimateNutritionImageBased({
              imagePath: editedLog.supabaseImagePath!,
              description: editedLog.description || "",
            });
          } else {
            console.log('📝 Text initial estimation');
            estimationResults = await estimateTextBased({
              description: editedLog.description || "",
            });
          }
        } else {
          // With components provided => run refine flow
          if (hasImage) {
            console.log('🖼️ Image refinement');
            estimationResults = await refineImageBased({
              imagePath: editedLog.supabaseImagePath!,
              description: editedLog.description || "",
              foodComponents: editedLog.foodComponents || [],
            });
          } else {
            console.log('🛠️ Text refinement');
            estimationResults = await refineTextBased({
              description: editedLog.description || "",
              foodComponents: editedLog.foodComponents || [],
            });
          }
        }

        const title =
          editedLog.title !== undefined && editedLog.title !== ""
            ? editedLog.title
            : estimationResults.generatedTitle;

        const completedLog: FoodLog = {
          ...editedLog,
          title,
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
        onComplete?.(completedLog);
        return;
      }

      // Create flow: add incomplete log, run initial estimation, then update store
      const logData = input as EstimationInput;
      const incompleteLog = createEstimationLog(logData);
      addFoodLog(incompleteLog);

      const isImageEstimation =
        logData.supabaseImagePath && logData.supabaseImagePath !== "";

      const estimationFunction = isImageEstimation
        ? () => {
            console.log('🖼️ Image initial estimation');
            return estimateNutritionImageBased({
              imagePath: logData.supabaseImagePath || "",
              description: logData.description || "",
            });
          }
        : () => {
            console.log('📝 Text initial estimation');
            return estimateTextBased({
              description: logData.description || "",
            });
          };

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

  return { runEstimation };
};

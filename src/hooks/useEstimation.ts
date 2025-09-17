import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { EstimationInput, createEstimationLog } from "@/utils/estimation";
import type { FoodLog } from "@/types/models";
import {
  estimateNutritionImageBased,
  estimateTextBased,
  refineEstimation,
  type RefinedFoodEstimateResponse,
  type FoodEstimateResponse,
} from "../lib";

// Helpers
const hasImage = (log: { supabaseImagePath?: string | null }): boolean =>
  !!log.supabaseImagePath && log.supabaseImagePath !== "";

const makeCompletedFromInitial = (
  base: FoodLog,
  results: FoodEstimateResponse
): FoodLog => ({
  ...base,
  title: results.generatedTitle,
  calories: results.calories,
  protein: results.protein,
  carbs: results.carbs,
  fat: results.fat,
  estimationConfidence: results.estimationConfidence,
  foodComponents: results.foodComponents,
  isEstimating: false,
});

const makeCompletedFromRefinement = (
  base: FoodLog,
  results: RefinedFoodEstimateResponse
): FoodLog => ({
  ...base,
  // Title remains unchanged, even if empty
  calories: results.calories,
  protein: results.protein,
  carbs: results.carbs,
  fat: results.fat,
  estimationConfidence: 100,
  isEstimating: false,
});

export const useEstimation = () => {
  const { addFoodLog, updateFoodLog, deleteFoodLog } = useAppStore();

  // Create page flow: add incomplete log, run initial estimation, update store
  const runCreateEstimation = useCallback(
    async (logData: EstimationInput) => {
      const incompleteLog = createEstimationLog(logData);
      addFoodLog(incompleteLog);

      const isImageEstimation = hasImage(logData);
      const estimationFunction = async () =>
        isImageEstimation
          ? (console.log("🖼️ Image initial estimation"),
            estimateNutritionImageBased({
              imagePath: logData.supabaseImagePath || "",
              description: logData.description || "",
            }))
          : (console.log("📝 Text initial estimation"),
            estimateTextBased({ description: logData.description || "" }));

      try {
        const estimationResults = await estimationFunction();
        const completedLog = makeCompletedFromInitial(
          incompleteLog,
          estimationResults
        );
        updateFoodLog(incompleteLog.id, completedLog);
      } catch (error) {
        deleteFoodLog(incompleteLog.id);
      }
    },
    [addFoodLog, updateFoodLog, deleteFoodLog]
  );

  // Edit page flow: refinement based solely on provided components
  const runEditEstimation = useCallback(
    async (editedLog: FoodLog, onComplete: (log: FoodLog) => void) => {
      const hasComponents = (editedLog.foodComponents?.length || 0) > 0;
      if (!hasComponents) {
        // Caller should prevent this; no-op for safety
        return;
      }
      console.log("🛠️ Components refinement");

      // Convert food components to string format: "Name Amount Unit, Name Amount Unit, ..."
      const foodComponentsString = (editedLog.foodComponents || [])
        .map(
          (component) =>
            `${component.name} ${component.amount} ${component.unit}`
        )
        .join(", ");

      const refined: RefinedFoodEstimateResponse = await refineEstimation({
        foodComponents: foodComponentsString,
      });
      const completedLog = makeCompletedFromRefinement(editedLog, refined);
      onComplete(completedLog);
    },
    []
  );

  return { runCreateEstimation, runEditEstimation };
};

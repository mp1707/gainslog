import { useCallback } from "react";
import { useNutritionEstimation } from "./useNutritionEstimation";
import { FoodLog } from "@/types";
import { useFoodLogStore } from "@/stores/useFoodLogStore";

/**
 * Business-logic hook that updates an existing FoodLog with new information
 * and handles AI re-estimation if needed.
 *
 *
 * It transparently handles optimistic UI updates and AI nutrition estimation.
 */
export const useUpdateFoodLog = () => {
  const { updateFoodLogInState, updateFoodLogById } = useFoodLogStore();

  const { processLogWithEstimation } = useNutritionEstimation();

  const update = useCallback(
    async (updatedLog: FoodLog) => {
      await processLogWithEstimation(
        updatedLog,
        // Optimistic UI update during processing
        (processingLog) => updateFoodLogInState(processingLog),
        // Final log → update UI + persist
        async (finalLog) => {
          updateFoodLogInState(finalLog);
          await updateFoodLogById(finalLog);
        }
      );
    },
    [updateFoodLogInState, updateFoodLogById, processLogWithEstimation]
  );

  return { update } as const;
};

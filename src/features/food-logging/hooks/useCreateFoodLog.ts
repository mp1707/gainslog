import { useCallback } from "react";
import { useNutritionEstimation } from "./useNutritionEstimation";
import { FoodLog } from "@/types";
import { useFoodLogStore } from "src/stores/useFoodLogStore";

/**
 * Business-logic hook that turns a (possibly partial) FoodLog coming from the modal
 * into a fully populated log that is persisted and shown in the UI.
 *
 * It transparently handles optimistic skeleton addition and AI nutrition estimation.
 */
export const useCreateFoodLog = () => {
  const { addFoodLogToState, updateFoodLogInState, addFoodLog } =
    useFoodLogStore();

  const { processLogWithEstimation } = useNutritionEstimation();

  const create = useCallback(
    async (initialLog: FoodLog) => {
      await processLogWithEstimation(
        initialLog,
        // Skeleton → optimistic UI update
        (skeleton) => addFoodLogToState(skeleton),
        // Final log → update UI + persist
        async (finalLog) => {
          updateFoodLogInState(finalLog);
          await addFoodLog(finalLog);
        }
      );
    },
    [
      addFoodLogToState,
      updateFoodLogInState,
      addFoodLog,
      processLogWithEstimation,
    ]
  );

  return { create } as const;
};

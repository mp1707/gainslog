import { useCallback } from "react";
import { useNutritionEstimation } from "./useNutritionEstimation";
import { LegacyFoodLog } from "@/types/indexLegacy";

import { showInvalidImageToast } from "@/lib/toast";
import { useFoodLogStore } from "src/legacystore/useFoodLogStore";

/**
 * Business-logic hook that turns a (possibly partial) FoodLog coming from the modal
 * into a fully populated log that is persisted and shown in the UI.
 *
 * It transparently handles optimistic skeleton addition and AI nutrition estimation.
 */
export const useCreateFoodLog = () => {
  const {
    addFoodLogToState,
    updateFoodLogInState,
    addFoodLog,
    removeFoodLogFromState,
  } = useFoodLogStore();

  const { processLogWithEstimation } = useNutritionEstimation();

  const create = useCallback(
    async (initialLog: LegacyFoodLog) => {
      await processLogWithEstimation(
        initialLog,
        // Skeleton → optimistic UI update
        (skeleton) => addFoodLogToState(skeleton),
        // Final log → update UI + persist
        async (finalLog) => {
          updateFoodLogInState(finalLog);
          await addFoodLog(finalLog);
        },
        // Invalid image → remove skeleton and show toast
        (logId) => {
          removeFoodLogFromState(logId);
          showInvalidImageToast();
        }
      );
    },
    [
      addFoodLogToState,
      updateFoodLogInState,
      addFoodLog,
      removeFoodLogFromState,
      processLogWithEstimation,
    ]
  );

  return { create } as const;
};

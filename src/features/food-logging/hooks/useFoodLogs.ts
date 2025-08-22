import { useEffect } from "react";
import { useFoodLogStore } from "src/stores/useFoodLogStore";

/**
 * Thin wrapper around `useFoodLogStore` that
 * 1. automatically loads logs on mount
 * 2. exposes a friendlier, stable API to components.
 */
export const useFoodLogs = () => {
  const {
    foodLogs,
    isLoadingLogs,
    loadFoodLogs,
    addFoodLog,
    updateFoodLogById,
    deleteFoodLogById,
  } = useFoodLogStore();

  // Ensure logs are pulled from AsyncStorage the first time this hook is used.
  useEffect(() => {
    loadFoodLogs();
  }, [loadFoodLogs]);

  return {
    logs: foodLogs,
    isLoading: isLoadingLogs,
    reload: loadFoodLogs,
    add: addFoodLog,
    update: updateFoodLogById,
    remove: deleteFoodLogById,
  } as const;
};

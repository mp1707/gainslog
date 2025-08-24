import { useCallback } from "react";
import { FoodLog } from "@/types";
import { generateFoodLogId } from "@/utils/idGenerator";
import { useAppStore } from "@/store";

interface UseFavoriteSelectionProps {
  selectedDate: string;
  onSelectionComplete?: () => void;
}

export const useFavoriteSelection = ({
  selectedDate,
  onSelectionComplete,
}: UseFavoriteSelectionProps) => {
  const addFoodLog = useAppStore((state) => state.addFoodLog);

  const selectFavorite = useCallback(
    (favorite: any) => {
      const now = new Date();
      const id = generateFoodLogId();

      const log: FoodLog = {
        id,
        userTitle: favorite.title,
        userDescription: favorite.description,
        generatedTitle: favorite.title,
        estimationConfidence: 100,
        userCalories: favorite.calories,
        userProtein: favorite.protein,
        userCarbs: favorite.carbs,
        userFat: favorite.fat,
        createdAt: now.toISOString(),
        date: selectedDate,
      };

      // Add directly without AI estimation
      addFoodLog(log);
      onSelectionComplete?.();
    },
    [selectedDate, addFoodLog, onSelectionComplete]
  );

  return {
    selectFavorite,
  };
};

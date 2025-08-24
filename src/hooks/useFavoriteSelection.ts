import { useCallback } from "react";
import { FavoriteEntry, LegacyFoodLog } from "src/types-legacy/indexLegacy";
import { generateFoodLogId } from "@/store-legacy/storage";
import { useFoodLogStore } from "src/store-legacy/useFoodLogStore";

interface UseFavoriteSelectionProps {
  selectedDate: string;
  onSelectionComplete?: () => void;
}

export const useFavoriteSelection = ({
  selectedDate,
  onSelectionComplete,
}: UseFavoriteSelectionProps) => {
  const addFoodLog = useFoodLogStore((state) => state.addFoodLog);

  const selectFavorite = useCallback(
    (favorite: FavoriteEntry) => {
      const now = new Date();
      const id = generateFoodLogId();

      const log: LegacyFoodLog = {
        id,
        userTitle: favorite.title,
        userDescription: favorite.description,
        generatedTitle: favorite.title,
        estimationConfidence: 100,
        calories: favorite.calories,
        protein: favorite.protein,
        carbs: favorite.carbs,
        fat: favorite.fat,
        createdAt: now.toISOString(),
        date: selectedDate,
        needsAiEstimation: false,
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

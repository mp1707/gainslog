import { FoodLog, Favorite, FoodComponent } from "@/types/models";
import { generateFoodLogId } from "@/utils/idGenerator";
import { useHudStore } from "@/store/useHudStore";

export const createLogAgainHandler = (
  addFoodLog: (log: FoodLog) => void,
  selectedDate: string
) => {
  return (log: FoodLog | Favorite) => {
    const now = new Date().toISOString();
    addFoodLog({
      id: generateFoodLogId(),
      logDate: selectedDate,
      createdAt: now,
      title: log.title,
      description: log.description,
      foodComponents: log.foodComponents.map((component) => ({
        ...component,
      })),
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      isEstimating: false,
    });
  };
};

export const createSaveToFavoritesHandler = (
  addFavorite: (fav: Favorite) => void,
  favorites: Favorite[]
) => {
  return (log: FoodLog | Favorite) => {
    const already = favorites.some((f) => f.id === log.id);
    if (already) return; // guard against duplicates

    addFavorite({
      id: log.id,
      title: log.title,
      description: log.description,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      foodComponents: log.foodComponents.map((component) => ({
        ...component,
      })),
    });

    // Use HUD instead of toast
    useHudStore.getState().show({
      type: "success",
      title: "Favorited",
      subtitle: log.title
    });
  };
};

export const createRemoveFromFavoritesHandler = (
  deleteFavorite: (id: string) => void,
  favorites: Favorite[]
) => {
  return (log: FoodLog | Favorite) => {
    const exists = favorites.some((f) => f.id === log.id);
    if (!exists) return; // nothing to remove
    deleteFavorite(log.id);

    // Use HUD instead of toast
    useHudStore.getState().show({
      type: "info",
      title: "Removed",
      subtitle: log.title
    });
  };
};

export const createEditHandler = (
  safeNavigate: (path: string) => void
) => {
  return (log: FoodLog | Favorite) => {
    safeNavigate(`/edit/${log.id}`);
  };
};

export const createDeleteHandler = (
  deleteFoodLog: (id: string) => void
) => {
  return (log: FoodLog | Favorite) => {
    deleteFoodLog(log.id);
  };
};

export const createToggleFavoriteHandler = (
  addFavorite: (fav: Favorite) => void,
  deleteFavorite: (id: string) => void,
  favorites: Favorite[]
) => {
  return (foodLog: FoodLog) => {
    const isFavorite = favorites.some((favorite) => favorite.id === foodLog.id);

    if (isFavorite) {
      deleteFavorite(foodLog.id);

      // Use HUD instead of toast
      useHudStore.getState().show({
        type: "info",
        title: "Removed",
        subtitle: foodLog.title
      });
    } else {
      addFavorite({
        ...foodLog,
        foodComponents: foodLog.foodComponents.map((component) => ({
          ...component,
        })),
      });

      // Use HUD instead of toast
      useHudStore.getState().show({
        type: "success",
        title: "Favorited",
        subtitle: foodLog.title
      });
    }
  };
};

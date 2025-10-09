import { FoodLog, Favorite, FoodComponent } from "@/types/models";
import { generateFoodLogId } from "@/utils/idGenerator";
import { useHudStore } from "@/store/useHudStore";

export const createLogAgainHandler = (
  addFoodLog: (log: FoodLog) => void,
  selectedDate: string
) => {
  return (log: FoodLog | Favorite) => {
    const now = new Date().toISOString();
    
    // Set needsRefinement = false for all food components since user is satisfied with current values
    const updatedFoodComponents: FoodComponent[] = log.foodComponents.map(component => ({
      ...component,
      needsRefinement: false
    }));

    addFoodLog({
      id: generateFoodLogId(),
      logDate: selectedDate,
      createdAt: now,
      title: log.title,
      description: log.description,
      foodComponents: updatedFoodComponents,
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

    // Set needsRefinement = false for all food components since user is satisfied with current values
    const updatedFoodComponents: FoodComponent[] = log.foodComponents.map(component => ({
      ...component,
      needsRefinement: false
    }));

    addFavorite({
      id: log.id,
      title: log.title,
      description: log.description,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      foodComponents: updatedFoodComponents,
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
      // Set needsRefinement = false for all food components since user is satisfied with current values
      const updatedFoodComponents: FoodComponent[] = foodLog.foodComponents.map(component => ({
        ...component,
        needsRefinement: false
      }));

      addFavorite({
        ...foodLog,
        foodComponents: updatedFoodComponents
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
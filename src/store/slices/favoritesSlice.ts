import { StateCreator } from "zustand";
import { FavoriteEntry, FoodLog } from "@/types";
import { generateFavoriteId } from "@/utils/idGenerator";

export interface FavoritesSlice {
  favorites: FavoriteEntry[];

  addFavorite: (foodLog: FoodLog) => void;
  updateFavorite: (id: string, updates: Partial<FavoriteEntry>) => void;
  deleteFavorite: (id: string) => void;
  createLogFromFavorite: (favoriteId: string, date: string) => void;
}

export const createFavoritesSlice: StateCreator<
  FavoritesSlice & { addFoodLog: (log: FoodLog) => void },
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  FavoritesSlice
> = (set, get) => ({
  favorites: [],

  addFavorite: (foodLog) =>
    set((state) => {
      // Create disconnected copy
      const favorite: FavoriteEntry = {
        id: generateFavoriteId(),
        createdAt: new Date().toISOString(),
        date: foodLog.date,
        title: foodLog.userTitle ?? foodLog.generatedTitle,
        description: foodLog.userDescription ?? foodLog.generatedDescription,
        calories: foodLog.userCalories ?? foodLog.generatedCalories,
        protein: foodLog.userProtein ?? foodLog.generatedProtein,
        carbs: foodLog.userCarbs ?? foodLog.generatedCarbs,
        fat: foodLog.userFat ?? foodLog.generatedFat,
        estimationConfidence: foodLog.estimationConfidence,
      };

      state.favorites.push(favorite);
    }),

  updateFavorite: (id, updates) =>
    set((state) => {
      const index = state.favorites.findIndex(
        (fav: FavoriteEntry) => fav.id === id
      );
      if (index !== -1) {
        Object.assign(state.favorites[index], updates);
      }
    }),

  deleteFavorite: (id) =>
    set((state) => {
      state.favorites = state.favorites.filter(
        (fav: FavoriteEntry) => fav.id !== id
      );
    }),

  createLogFromFavorite: (favoriteId, date) => {
    const favorite = get().favorites.find(
      (fav: FavoriteEntry) => fav.id === favoriteId
    );
    if (!favorite) return;

    // Create new disconnected log
    const newLog: FoodLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      date,
      userTitle: favorite.title,
      userDescription: favorite.description,
      userCalories: favorite.calories,
      userProtein: favorite.protein,
      userCarbs: favorite.carbs,
      userFat: favorite.fat,
      estimationConfidence: favorite.estimationConfidence,
    };

    get().addFoodLog(newLog);
  },
});

import { StateCreator } from "zustand";
import { FavoriteEntry, FoodLog } from "@/types";

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
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        date: foodLog.date,
        title: foodLog.userTitle || foodLog.generatedTitle,
        description: foodLog.userDescription || foodLog.description || "",
        calories: (foodLog.userCalories !== undefined
          ? foodLog.userCalories
          : foodLog.calories
        ).toString(),
        protein: (foodLog.userProtein !== undefined
          ? foodLog.userProtein
          : foodLog.protein
        ).toString(),
        carbs: (foodLog.userCarbs !== undefined
          ? foodLog.userCarbs
          : foodLog.carbs
        ).toString(),
        fat: (foodLog.userFat !== undefined
          ? foodLog.userFat
          : foodLog.fat
        ).toString(),
        estimationConfidence: (foodLog.estimationConfidence || 100).toString(),
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
      generatedTitle: favorite.title,
      estimationConfidence: parseFloat(favorite.estimationConfidence),
      calories: parseFloat(favorite.calories),
      protein: parseFloat(favorite.protein),
      carbs: parseFloat(favorite.carbs),
      fat: parseFloat(favorite.fat),
      userCalories: parseFloat(favorite.calories),
      userProtein: parseFloat(favorite.protein),
      userCarbs: parseFloat(favorite.carbs),
      userFat: parseFloat(favorite.fat),
    };

    get().addFoodLog(newLog);
  },
});

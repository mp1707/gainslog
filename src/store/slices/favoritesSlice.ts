import { StateCreator } from "zustand";
import { FavoriteEntry, FoodLog } from "@/types";
import { generateFavoriteId } from "@/utils/idGenerator";

export interface FavoritesSlice {
  favorites: FavoriteEntry[];

  addFavorite: (foodLog: FoodLog) => void;
  updateFavorite: (id: string, updates: Partial<FavoriteEntry>) => void;
  deleteFavorite: (id: string) => void;
  createLogFromFavorite: (favoriteId: string, date: string) => void;
  toggleFavoriteForLog: (foodLog: FoodLog) => void;
  isFavoriteForLog: (foodLog: FoodLog) => boolean;
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

  toggleFavoriteForLog: (foodLog) => {
    const normalize = (value?: string) => (value || "").trim().toLowerCase();

    const toComparable = (log: FoodLog) => ({
      title: normalize(log.userTitle ?? log.generatedTitle),
      description: normalize(log.userDescription ?? log.generatedDescription),
      calories: (log.userCalories ?? log.generatedCalories) || 0,
      protein: (log.userProtein ?? log.generatedProtein) || 0,
      carbs: (log.userCarbs ?? log.generatedCarbs) || 0,
      fat: (log.userFat ?? log.generatedFat) || 0,
    });

    const comp = toComparable(foodLog);
    const existing = get().favorites.find((fav) => {
      const favComp = {
        title: normalize(fav.title),
        description: normalize(fav.description),
        calories: fav.calories || 0,
        protein: fav.protein || 0,
        carbs: fav.carbs || 0,
        fat: fav.fat || 0,
      };
      return (
        favComp.title === comp.title &&
        favComp.description === comp.description &&
        favComp.calories === comp.calories &&
        favComp.protein === comp.protein &&
        favComp.carbs === comp.carbs &&
        favComp.fat === comp.fat
      );
    });

    if (existing) {
      // Remove existing
      set((state) => {
        state.favorites = state.favorites.filter((f) => f.id !== existing.id);
      });
    } else {
      // Add new
      get().addFavorite(foodLog);
    }
  },

  isFavoriteForLog: (foodLog) => {
    const normalize = (value?: string) => (value || "").trim().toLowerCase();
    const comp = {
      title: normalize(foodLog.userTitle ?? foodLog.generatedTitle),
      description: normalize(
        foodLog.userDescription ?? foodLog.generatedDescription
      ),
      calories: (foodLog.userCalories ?? foodLog.generatedCalories) || 0,
      protein: (foodLog.userProtein ?? foodLog.generatedProtein) || 0,
      carbs: (foodLog.userCarbs ?? foodLog.generatedCarbs) || 0,
      fat: (foodLog.userFat ?? foodLog.generatedFat) || 0,
    };

    return (
      get().favorites.find((fav) => {
        return (
          normalize(fav.title) === comp.title &&
          normalize(fav.description) === comp.description &&
          (fav.calories || 0) === comp.calories &&
          (fav.protein || 0) === comp.protein &&
          (fav.carbs || 0) === comp.carbs &&
          (fav.fat || 0) === comp.fat
        );
      }) !== undefined
    );
  },
});

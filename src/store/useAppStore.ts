import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { FoodLog, Favorite, DailyTargets, UserSettings } from "../types/models";

type AppState = {
  foodLogs: FoodLog[];
  favorites: Favorite[];
  dailyTargets?: DailyTargets;
  userSettings?: UserSettings;

  // Logs
  addFoodLog: (log: FoodLog) => void;
  updateFoodLog: (id: string, update: Partial<FoodLog>) => void;
  deleteFoodLog: (id: string) => void;
  clearAllLogs: () => void;

  // Favorites
  addFavorite: (fav: Favorite) => void;
  deleteFavorite: (id: string) => void;

  // Settings
  setDailyTargets: (targets: DailyTargets) => void;
  setUserSettings: (settings: UserSettings) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      foodLogs: [],
      favorites: [],
      dailyTargets: undefined,
      userSettings: undefined,

      // Logs
      addFoodLog: (log) =>
        set((state) => {
          state.foodLogs.push(log);
        }),

      updateFoodLog: (id, update) =>
        set((state) => {
          const log = state.foodLogs.find((l) => l.id === id);
          if (log) Object.assign(log, update);
        }),

      deleteFoodLog: (id) =>
        set((state) => {
          state.foodLogs = state.foodLogs.filter((log) => log.id !== id);
        }),

      clearAllLogs: () => set((state) => { state.foodLogs = []; }),

      // Favorites
      addFavorite: (fav) =>
        set((state) => {
          state.favorites.push(fav);
        }),

      deleteFavorite: (id) =>
        set((state) => {
          state.favorites = state.favorites.filter((f) => f.id !== id);
        }),

      // Settings
      setDailyTargets: (targets) =>
        set((state) => {
          state.dailyTargets = targets;
        }),

      setUserSettings: (settings) =>
        set((state) => {
          state.userSettings = settings;
        }),
    })),
    { name: "food-app" }
  )
);

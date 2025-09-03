import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FoodLog, Favorite, DailyTargets, UserSettings } from "../types/models";

type AppState = {
  foodLogs: FoodLog[];
  favorites: Favorite[];
  dailyTargets?: DailyTargets;
  userSettings?: UserSettings;

  // UI state
  selectedDate: string; // YYYY-MM-DD (for day view)
  selectedMonth: string; // YYYY-MM (for month view)

  // Logs
  addFoodLog: (log: FoodLog) => void;
  updateFoodLog: (id: string, update: Partial<FoodLog>) => void;
  deleteFoodLog: (id: string) => void;
  clearAllLogs: () => void;
  cleanupIncompleteEstimations: () => void;
  setFoodlogs: (logs: FoodLog[]) => void;

  // Favorites
  addFavorite: (fav: Favorite) => void;
  deleteFavorite: (id: string) => void;

  // Settings
  setDailyTargets: (targets: DailyTargets) => void;
  setUserSettings: (settings: UserSettings) => void;

  // UI
  setSelectedDate: (date: string) => void;
  setSelectedMonth: (month: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      foodLogs: [],
      favorites: [],
      dailyTargets: undefined,
      userSettings: undefined,

      // default to today’s date & current month
      selectedDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM

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

      clearAllLogs: () =>
        set((state) => {
          state.foodLogs = [];
        }),

      cleanupIncompleteEstimations: () =>
        set((state) => {
          state.foodLogs = state.foodLogs.filter(
            (log) =>
              (log.title !== "" && log.title !== null) ||
              log.isEstimating === false
          );
        }),

      setFoodlogs: (logs) =>
        set((state) => {
          state.foodLogs = logs;
        }),

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

      // UI
      setSelectedDate: (date) =>
        set((state) => {
          state.selectedDate = date;
        }),

      setSelectedMonth: (month) =>
        set((state) => {
          state.selectedMonth = month;
        }),
    })),
    {
      name: "food-app",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

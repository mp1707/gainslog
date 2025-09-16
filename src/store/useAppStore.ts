import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FoodLog, Favorite, DailyTargets, UserSettings } from "../types/models";
import { getTodayKey } from "@/utils/dateHelpers";
import * as FileSystem from "expo-file-system"; // --- 1. IMPORT EXPO-FILE-SYSTEM ---

export type AppState = {
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
  deleteFoodLog: (id: string) => Promise<void>; // Make it async
  clearAllLogs: () => Promise<void>; // Make it async
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
    immer((set, get) => ({
      foodLogs: [],
      favorites: [],
      dailyTargets: undefined,
      userSettings: undefined,

      // default to today's date & current month (local timezone aware)
      selectedDate: getTodayKey(), // YYYY-MM-DD (local)
      selectedMonth: getTodayKey().slice(0, 7), // YYYY-MM (local)

      // Logs
      addFoodLog: (log) =>
        set((state) => {
          state.foodLogs.push(log);
        }),

      updateFoodLog: (id, update) =>
        set((state) => {
          // Create new objects/array so FlatList + memoized cards re-render
          state.foodLogs = state.foodLogs.map((l) =>
            l.id === id ? { ...l, ...update } : l
          );
        }),

      deleteFoodLog: async (id) => {
        // First, find the log to get its on device image path
        const logToDelete = get().foodLogs.find((log) => log.id === id);

        // If the log has a local image, delete it from the file system
        if (logToDelete && logToDelete.localImagePath) {
          try {
            await FileSystem.deleteAsync(logToDelete.localImagePath, {
              idempotent: true, // This is crucial, it won't throw an error if the file doesn't exist
            });
          } catch (error) {}
        }
        set((state) => {
          state.foodLogs = state.foodLogs.filter((log) => log.id !== id);
        });
      },

      // --- 4. PROACTIVELY ENHANCE `clearAllLogs` FOR COMPLETE CLEANUP ---
      clearAllLogs: async () => {
        // Get all image paths that need to be deleted
        const imagePathsToDelete = get()
          .foodLogs.map((log) => log.localImagePath)
          .filter((path): path is string => !!path); // Filter out any null/undefined paths

        if (imagePathsToDelete.length > 0) {
          try {
            // Use Promise.all to delete all files concurrently for better performance
            await Promise.all(
              imagePathsToDelete.map((uri) =>
                FileSystem.deleteAsync(uri, { idempotent: true })
              )
            );
            console.log(`Deleted ${imagePathsToDelete.length} images.`);
          } catch (error) {
            console.error("Error batch deleting images:", error);
          }
        }

        // Finally, clear the logs from the state
        set((state) => {
          state.foodLogs = [];
        });
      },

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

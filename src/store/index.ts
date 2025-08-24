import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createFoodLogsSlice, FoodLogsSlice } from "./slices/foodLogsSlice";
import { createFavoritesSlice, FavoritesSlice } from "./slices/favoritesSlice";
import {
  createUserSettingsSlice,
  UserSettingsSlice,
} from "./slices/userSettingsSlice";
import {
  createWeightLogsSlice,
  WeightLogsSlice,
} from "./slices/weightLogsSlice";

export type AppStore = FoodLogsSlice &
  FavoritesSlice &
  UserSettingsSlice &
  WeightLogsSlice & {
    // UI triggers for new log actions
    triggerAction:
      | "manual"
      | "camera"
      | "library"
      | "audio"
      | "favorites"
      | null;
    triggerManualLog: () => void;
    triggerCameraCapture: () => void;
    triggerLibraryCapture: () => void;
    triggerAudioCapture: () => void;
    triggerFavorites: () => void;
    clearTrigger: () => void;
  };

export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get, store) => ({
      // @ts-expect-error TODO
      ...createFoodLogsSlice(set, get, store),
      // @ts-expect-error TODO
      ...createFavoritesSlice(set, get, store),
      // @ts-expect-error TODO
      ...createUserSettingsSlice(set, get, store),
      // @ts-expect-error TODO
      ...createWeightLogsSlice(set, get, store),

      // UI triggers (not persisted via partialize below except triggerAction state will rehydrate but is harmless)
      triggerAction: null,
      triggerManualLog: () => set(() => ({ triggerAction: "manual" })),
      triggerCameraCapture: () => set(() => ({ triggerAction: "camera" })),
      triggerLibraryCapture: () => set(() => ({ triggerAction: "library" })),
      triggerAudioCapture: () => set(() => ({ triggerAction: "audio" })),
      triggerFavorites: () => set(() => ({ triggerAction: "favorites" })),
      clearTrigger: () => set(() => ({ triggerAction: null })),
    })),
    {
      name: "gainslog-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist everything except temporary UI states
        foodLogs: state.foodLogs,
        favorites: state.favorites,
        userSettings: state.userSettings,
        dailyTargets: state.dailyTargets,
        weightLogs: state.weightLogs,
        // Don't persist selectedDate as it should always start with today
        // Do not persist triggerAction
      }),
      onRehydrateStorage: () => (state) => {
        // Reset selectedDate to today when app starts
        if (state) {
          state.selectedDate = new Date().toISOString().split("T")[0];
          state.triggerAction = null;
        }
      },
    }
  )
);

// Convenience selectors
export const useSelectedDateLogs = () => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const logs = useAppStore((state) => state.getLogsByDate(selectedDate));
  return logs;
};

export const useSelectedDateTotals = () => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const totals = useAppStore((state) => state.getDailyTotals(selectedDate));
  const targets = useAppStore((state) => state.dailyTargets);

  const progress = targets
    ? {
        calories: (totals.calories / targets.calories) * 100,
        protein: (totals.protein / targets.protein) * 100,
        carbs: (totals.carbs / targets.carbs) * 100,
        fat: (totals.fat / targets.fat) * 100,
      }
    : null;

  return { totals, targets, progress };
};

import { StateCreator } from "zustand";
import { FoodLog } from "@/types";

export interface FoodLogsSlice {
  // State
  foodLogs: FoodLog[];
  selectedDate: string; // ISO date string

  // Actions
  addFoodLog: (log: FoodLog) => void;
  updateFoodLog: (id: string, updates: Partial<FoodLog>) => void;
  deleteFoodLog: (id: string) => void;
  setSelectedDate: (date: string) => void;

  // Computed selectors
  getLogsByDate: (date: string) => FoodLog[];
  getDailyTotals: (date: string) => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const createFoodLogsSlice: StateCreator<
  FoodLogsSlice,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  FoodLogsSlice
> = (set, get) => ({
  // Initial state
  foodLogs: [],
  selectedDate: new Date().toISOString().split("T")[0],

  // Actions
  addFoodLog: (log) =>
    set((state) => {
      state.foodLogs.push(log);
    }),

  updateFoodLog: (id, updates) =>
    set((state) => {
      const index = state.foodLogs.findIndex((log: FoodLog) => log.id === id);
      if (index !== -1) {
        Object.assign(state.foodLogs[index], updates);
      }
    }),

  deleteFoodLog: (id) =>
    set((state) => {
      state.foodLogs = state.foodLogs.filter((log: FoodLog) => log.id !== id);
    }),

  setSelectedDate: (date) =>
    set((state) => {
      state.selectedDate = date;
    }),

  // Computed selectors
  getLogsByDate: (date) => {
    return get().foodLogs.filter((log) => log.date === date);
  },

  getDailyTotals: (date) => {
    const logs = get().getLogsByDate(date);

    return logs.reduce(
      (totals, log) => {
        // Use user values if available, otherwise use AI-generated values
        const calories =
          log.userCalories !== undefined ? log.userCalories : log.calories;
        const protein =
          log.userProtein !== undefined ? log.userProtein : log.protein;
        const carbs = log.userCarbs !== undefined ? log.userCarbs : log.carbs;
        const fat = log.userFat !== undefined ? log.userFat : log.fat;

        return {
          calories: totals.calories + calories,
          protein: totals.protein + protein,
          carbs: totals.carbs + carbs,
          fat: totals.fat + fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },
});

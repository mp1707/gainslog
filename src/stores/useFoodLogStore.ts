import { create } from "zustand";
import { Alert } from "react-native";
import { router } from "expo-router";
import { FoodLog, DailyTargets, DailyProgress } from "../types";
import { ProteinCalculationMethod } from "../shared/ui/atoms/ProteinCalculationCard";
import { CalorieCalculationMethod } from "../shared/ui/atoms/CalorieCalculationCard";
import { CalorieIntakeParams, ActivityLevel } from "../utils/calculateCalories";
import { GoalType } from "../shared/ui/atoms/GoalSelectionCard";

import {
  getFoodLogs,
  saveFoodLog,
  updateFoodLog,
  deleteFoodLog,
  getDailyTargets,
  saveDailyTargets,
} from "@/lib/storage";

type ActionType = "manual" | "camera" | "library" | "audio" | null;

interface ProteinCalculationSelection {
  method: ProteinCalculationMethod;
  bodyWeight: number;
  calculatedProtein: number;
  timestamp: number;
}

interface CalorieCalculationSelection {
  method: CalorieCalculationMethod;
  params: CalorieIntakeParams;
  activityLevel: ActivityLevel;
  calculatedCalories: number;
  goalType: GoalType;
  timestamp: number;
}

interface FoodLogStore {
  // Data state
  foodLogs: FoodLog[];
  isLoadingLogs: boolean;

  // Date filtering state
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  selectedMonth: string; // ISO month string (YYYY-MM)

  // Action trigger state
  triggerAction: ActionType;

  // Nutrition targets state
  dailyTargets: DailyTargets;
  isLoadingTargets: boolean;

  // Protein calculation state
  proteinCalculation: ProteinCalculationSelection | null;

  // Calorie calculation state
  calorieCalculation: CalorieCalculationSelection | null;

  // Data actions
  loadFoodLogs: () => Promise<void>;
  addFoodLog: (log: FoodLog) => Promise<void>;
  updateFoodLogById: (log: FoodLog) => Promise<void>;
  deleteFoodLogById: (logId: string) => Promise<void>;

  // State-only updates (for optimistic UI updates)
  updateFoodLogInState: (log: FoodLog) => void;
  addFoodLogToState: (log: FoodLog) => void;
  removeFoodLogFromState: (logId: string) => void;

  // Action triggers
  triggerManualLog: () => void;
  triggerCameraCapture: () => void;
  triggerLibraryCapture: () => void;
  triggerAudioCapture: () => void;
  setTriggerAction: (action: ActionType) => void;
  clearTrigger: () => void;

  // Date actions
  setSelectedDate: (date: string) => void;
  setSelectedMonth: (month: string) => void;
  getFilteredFoodLogs: () => FoodLog[];
  getMonthlyFoodLogs: () => FoodLog[];
  getDailyTotalsForMonth: () => Array<{
    date: string;
    totals: { calories: number; protein: number; carbs: number; fat: number };
  }>;
  navigateToTodayWithDate: (date: string) => void;

  // Nutrition targets actions
  loadDailyTargets: () => Promise<void>;
  updateDailyTargets: (targets: DailyTargets) => Promise<void>;
  updateDailyTargetsDebounced: (targets: DailyTargets) => void;
  resetDailyTargets: () => Promise<void>;

  // Protein calculation actions
  setProteinCalculation: (method: ProteinCalculationMethod, bodyWeight: number, calculatedProtein: number) => void;
  clearProteinCalculation: () => void;

  // Calorie calculation actions
  setCalorieCalculation: (method: CalorieCalculationMethod, params: CalorieIntakeParams, activityLevel: ActivityLevel, calculatedCalories: number, goalType: GoalType) => void;
  clearCalorieCalculation: () => void;

  // Progress calculations
  getDailyProgress: () => DailyProgress;
}

// Helper function to get today's date in ISO format (YYYY-MM-DD) in local timezone
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to convert Date to local date string (YYYY-MM-DD)
const dateToLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get current month in ISO format (YYYY-MM)
const getCurrentMonthString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// Debounce helper for auto-saving targets
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 800; // 800ms delay

export const useFoodLogStore = create<FoodLogStore>((set, get) => ({
  // Initial state
  foodLogs: [],
  isLoadingLogs: true,
  selectedDate: getTodayDateString(),
  selectedMonth: getCurrentMonthString(),
  triggerAction: null,
  dailyTargets: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  },
  isLoadingTargets: true,
  // Protein calculation initial state
  proteinCalculation: null,
  // Calorie calculation initial state
  calorieCalculation: null,

  // Data actions
  loadFoodLogs: async () => {
    set({ isLoadingLogs: true });
    try {
      const logs = await getFoodLogs();

      // Ensure backward compatibility by adding date field to logs that don't have it
      const migratedLogs = logs.map((log) => ({
        ...log,
        date: log.date || dateToLocalDateString(new Date(log.createdAt)),
      }));

      set({ foodLogs: migratedLogs });
    } catch (error) {
      console.error("Error loading food logs:", error);
      Alert.alert("Error", "Failed to load food logs from storage");
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  addFoodLog: async (log: FoodLog) => {
    try {
      await saveFoodLog(log);
      const { foodLogs } = get();

      // Check if log already exists in state
      const existingIndex = foodLogs.findIndex((item) => item.id === log.id);

      if (existingIndex !== -1) {
        // Replace existing log
        const updated = [...foodLogs];
        updated[existingIndex] = log;
        set({ foodLogs: updated });
      } else {
        // Add new log
        set({ foodLogs: [log, ...foodLogs] });
      }
    } catch (error) {
      console.error("Error adding food log:", error);
      throw error;
    }
  },

  updateFoodLogById: async (log: FoodLog) => {
    try {
      await updateFoodLog(log);
      const { foodLogs } = get();

      set({
        foodLogs: foodLogs.map((item) => (item.id === log.id ? log : item)),
      });
    } catch (error) {
      console.error("Error updating food log:", error);
      throw error;
    }
  },

  deleteFoodLogById: async (logId: string) => {
    try {
      await deleteFoodLog(logId);
      const { foodLogs } = get();

      set({
        foodLogs: foodLogs.filter((log) => log.id !== logId),
      });
    } catch (error) {
      console.error("Error deleting food log:", error);
      Alert.alert("Error", "Failed to delete food log. Please try again.");
      throw error;
    }
  },

  // State-only updates (for optimistic UI updates)
  updateFoodLogInState: (log: FoodLog) => {
    const { foodLogs } = get();
    set({
      foodLogs: foodLogs.map((item) => (item.id === log.id ? log : item)),
    });
  },

  addFoodLogToState: (log: FoodLog) => {
    const { foodLogs } = get();

    // Check if log already exists in state
    const existingIndex = foodLogs.findIndex((item) => item.id === log.id);

    if (existingIndex !== -1) {
      // Replace existing log
      const updated = [...foodLogs];
      updated[existingIndex] = log;
      set({ foodLogs: updated });
    } else {
      // Add new log
      set({ foodLogs: [log, ...foodLogs] });
    }
  },

  removeFoodLogFromState: (logId: string) => {
    const { foodLogs } = get();
    set({
      foodLogs: foodLogs.filter((log) => log.id !== logId),
    });
  },

  // Action triggers
  triggerManualLog: () => set({ triggerAction: "manual" }),
  triggerCameraCapture: () => set({ triggerAction: "camera" }),
  triggerLibraryCapture: () => set({ triggerAction: "library" }),
  triggerAudioCapture: () => set({ triggerAction: "audio" }),
  setTriggerAction: (action: ActionType) => set({ triggerAction: action }),
  clearTrigger: () => set({ triggerAction: null }),

  // Date actions
  setSelectedDate: (date: string) => set({ selectedDate: date }),
  setSelectedMonth: (month: string) => set({ selectedMonth: month }),

  getFilteredFoodLogs: () => {
    const { foodLogs, selectedDate } = get();
    return foodLogs.filter((log) => log.date === selectedDate);
  },

  getMonthlyFoodLogs: () => {
    const { foodLogs, selectedMonth } = get();
    return foodLogs.filter((log) => log.date.startsWith(selectedMonth));
  },

  getDailyTotalsForMonth: () => {
    const monthlyLogs = get().getMonthlyFoodLogs();

    // Group logs by date
    const logsByDate = monthlyLogs.reduce((acc, log) => {
      const date = log.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as Record<string, FoodLog[]>);

    // Calculate totals for each date
    const dailyTotals = Object.entries(logsByDate).map(([date, logs]) => ({
      date,
      totals: logs.reduce(
        (totals, log) => ({
          calories: totals.calories + log.calories,
          protein: totals.protein + log.protein,
          carbs: totals.carbs + log.carbs,
          fat: totals.fat + log.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    }));

    // Sort by date descending (most recent first)
    return dailyTotals.sort((a, b) => b.date.localeCompare(a.date));
  },

  navigateToTodayWithDate: (date: string) => {
    set({ selectedDate: date });
    router.push("/(tabs)/");
  },

  // Nutrition targets actions
  loadDailyTargets: async () => {
    set({ isLoadingTargets: true });
    try {
      const targets = await getDailyTargets();
      set({ dailyTargets: targets });
    } catch (error) {
      console.error("Error loading daily targets:", error);
      Alert.alert("Error", "Failed to load daily targets");
    } finally {
      set({ isLoadingTargets: false });
    }
  },

  updateDailyTargets: async (targets: DailyTargets) => {
    try {
      await saveDailyTargets(targets);
      set({ dailyTargets: targets });
    } catch (error) {
      console.error("Error updating daily targets:", error);
      throw error;
    }
  },

  updateDailyTargetsDebounced: (targets: DailyTargets) => {
    const currentState = get();
    
    // Check if protein value was manually changed (differs from both current target and calculated value)
    const proteinValueChanged = targets.protein !== currentState.dailyTargets.protein;
    const proteinManuallyChanged = currentState.proteinCalculation && 
      proteinValueChanged &&
      targets.protein !== currentState.proteinCalculation.calculatedProtein;
    
    // Check if calorie value was manually changed (differs from both current target and calculated value)
    const calorieValueChanged = targets.calories !== currentState.dailyTargets.calories;
    const calorieManuallyChanged = currentState.calorieCalculation && 
      calorieValueChanged &&
      targets.calories !== currentState.calorieCalculation.calculatedCalories;
    
    // Update state immediately for responsive UI
    set({ 
      dailyTargets: targets,
      // Clear protein calculation only if protein was manually changed
      proteinCalculation: proteinManuallyChanged ? null : currentState.proteinCalculation,
      // Clear calorie calculation only if calorie was manually changed
      calorieCalculation: calorieManuallyChanged ? null : currentState.calorieCalculation,
    });

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer to save after delay
    debounceTimer = setTimeout(async () => {
      try {
        await saveDailyTargets(targets);
      } catch (error) {
        console.error("Error auto-saving daily targets:", error);
        // Could add subtle error handling here if needed
      }
    }, DEBOUNCE_DELAY);
  },

  // Progress calculations
  getDailyProgress: (): DailyProgress => {
    const { dailyTargets } = get();
    const filteredLogs = get().getFilteredFoodLogs();

    const current = filteredLogs.reduce(
      (totals, log) => ({
        calories: totals.calories + log.calories,
        protein: totals.protein + log.protein,
        carbs: totals.carbs + log.carbs,
        fat: totals.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const percentages = {
      calories:
        dailyTargets.calories > 0
          ? Math.round((current.calories / dailyTargets.calories) * 100)
          : 0,
      protein:
        dailyTargets.protein > 0
          ? Math.round((current.protein / dailyTargets.protein) * 100)
          : 0,
      carbs:
        dailyTargets.carbs > 0
          ? Math.round((current.carbs / dailyTargets.carbs) * 100)
          : 0,
      fat:
        dailyTargets.fat > 0
          ? Math.round((current.fat / dailyTargets.fat) * 100)
          : 0,
    };

    return {
      current,
      targets: dailyTargets,
      percentages,
    };
  },

  // Protein calculation actions
  setProteinCalculation: (method: ProteinCalculationMethod, bodyWeight: number, calculatedProtein: number) => {
    const proteinCalculation: ProteinCalculationSelection = {
      method,
      bodyWeight,
      calculatedProtein,
      timestamp: Date.now(),
    };
    
    // Update protein target to calculated value
    const currentTargets = get().dailyTargets;
    const newTargets = {
      ...currentTargets,
      protein: calculatedProtein,
    };
    
    set({ 
      proteinCalculation,
      dailyTargets: newTargets,
    });
    
    // Save updated targets
    get().updateDailyTargetsDebounced(newTargets);
  },

  clearProteinCalculation: () => {
    set({ proteinCalculation: null });
  },

  // Calorie calculation actions
  setCalorieCalculation: (method: CalorieCalculationMethod, params: CalorieIntakeParams, activityLevel: ActivityLevel, calculatedCalories: number, goalType: GoalType) => {
    const calorieCalculation: CalorieCalculationSelection = {
      method,
      params,
      activityLevel,
      calculatedCalories,
      goalType,
      timestamp: Date.now(),
    };
    
    set({ calorieCalculation });
  },

  clearCalorieCalculation: () => {
    set({ calorieCalculation: null });
  },

  resetDailyTargets: async () => {
    const resetTargets: DailyTargets = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    
    try {
      await saveDailyTargets(resetTargets);
      set({ 
        dailyTargets: resetTargets,
        proteinCalculation: null,
        calorieCalculation: null,
      });
    } catch (error) {
      console.error("Error resetting daily targets:", error);
      Alert.alert("Error", "Failed to reset daily targets");
      throw error;
    }
  },
}));

// Export types for components that need them
export type { ActionType, ProteinCalculationSelection };

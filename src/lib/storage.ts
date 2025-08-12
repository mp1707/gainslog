import AsyncStorage from "@react-native-async-storage/async-storage";
import { FoodLog, DailyTargets, FavoriteEntry } from "../types";
import type { CalorieIntakeParams, Sex } from "@/types";

// Centralized, typed storage keys to avoid typos and ease migrations
export const storageKeys = {
  FOOD_LOGS: "food_logs",
  DAILY_TARGETS: "daily_targets",
  COLOR_SCHEME: "color_scheme",
  CALORIE_CALCULATOR_PARAMS: "calorie_calculator_params",
  FAVORITE_ENTRIES: "favorite_entries",
} as const;

const FOOD_LOGS_KEY = storageKeys.FOOD_LOGS;
const DAILY_TARGETS_KEY = storageKeys.DAILY_TARGETS;
const COLOR_SCHEME_KEY = storageKeys.COLOR_SCHEME;
const CALORIE_CALCULATOR_PARAMS_KEY = storageKeys.CALORIE_CALCULATOR_PARAMS;
const FAVORITE_ENTRIES_KEY = storageKeys.FAVORITE_ENTRIES;

/**
 * Save a food log to AsyncStorage
 */
export const saveFoodLog = async (foodLog: FoodLog): Promise<void> => {
  try {
    const existingLogs = await getFoodLogs();

    // Check if log with same ID already exists
    const existingLogIndex = existingLogs.findIndex(
      (log) => log.id === foodLog.id
    );
    if (existingLogIndex !== -1) {
      // Replace existing log instead of adding duplicate
      existingLogs[existingLogIndex] = foodLog;
      await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(existingLogs));
    } else {
      // Add new log to the beginning
      const updatedLogs = [foodLog, ...existingLogs];
      await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(updatedLogs));
    }
  } catch (error) {
    console.error("Error saving food log:", error);
    throw new Error("Failed to save food log");
  }
};

/**
 * Get all food logs from AsyncStorage
 */
export const getFoodLogs = async (): Promise<FoodLog[]> => {
  try {
    const logsJson = await AsyncStorage.getItem(FOOD_LOGS_KEY);
    if (!logsJson) {
      return [];
    }
    return JSON.parse(logsJson) as FoodLog[];
  } catch (error) {
    console.error("Error getting food logs:", error);
    return [];
  }
};

/**
 * Update an existing food log
 */
export const updateFoodLog = async (updatedLog: FoodLog): Promise<void> => {
  try {
    const existingLogs = await getFoodLogs();
    const updatedLogs = existingLogs.map((log) =>
      log.id === updatedLog.id ? updatedLog : log
    );
    await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error("Error updating food log:", error);
    throw new Error("Failed to update food log");
  }
};

/**
 * Delete a food log by ID
 */
export const deleteFoodLog = async (id: string): Promise<void> => {
  try {
    const existingLogs = await getFoodLogs();
    const filteredLogs = existingLogs.filter((log) => log.id !== id);
    await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(filteredLogs));
  } catch (error) {
    console.error("Error deleting food log:", error);
    throw new Error("Failed to delete food log");
  }
};

/**
 * Clear all food logs (useful for testing or reset)
 */
export const clearAllFoodLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FOOD_LOGS_KEY);
  } catch (error) {
    console.error("Error clearing food logs:", error);
    throw new Error("Failed to clear food logs");
  }
};

/**
 * Generate a unique ID for food logs
 */
export const generateFoodLogId = (): string => {
  return `food_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Default daily targets based on common nutritional guidelines
const DEFAULT_TARGETS: DailyTargets = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

/**
 * Save daily nutrition targets to AsyncStorage
 */
export const saveDailyTargets = async (
  targets: DailyTargets
): Promise<void> => {
  try {
    await AsyncStorage.setItem(DAILY_TARGETS_KEY, JSON.stringify(targets));
  } catch (error) {
    console.error("Error saving daily targets:", error);
    throw new Error("Failed to save daily targets");
  }
};

/**
 * Get daily nutrition targets from AsyncStorage
 */
export const getDailyTargets = async (): Promise<DailyTargets> => {
  try {
    const targetsJson = await AsyncStorage.getItem(DAILY_TARGETS_KEY);
    if (!targetsJson) {
      return DEFAULT_TARGETS;
    }
    return JSON.parse(targetsJson) as DailyTargets;
  } catch (error) {
    console.error("Error getting daily targets:", error);
    return DEFAULT_TARGETS;
  }
};

export const saveColorSchemePreference = async (
  scheme: import("../theme").ColorScheme
): Promise<void> => {
  try {
    await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
  } catch (error) {
    console.error("Error saving color scheme preference:", error);
    throw new Error("Failed to save color scheme preference");
  }
};

export const getColorSchemePreference = async (): Promise<
  import("../theme").ColorScheme | null
> => {
  try {
    const stored = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
    if (stored === "light" || stored === "dark") {
      return stored as import("../theme").ColorScheme;
    }
    return null;
  } catch (error) {
    console.error("Error getting color scheme preference:", error);
    return null;
  }
};

// Default calorie calculator parameters
const DEFAULT_CALORIE_CALCULATOR_PARAMS: CalorieIntakeParams = {
  sex: "male" as Sex,
  age: 30,
  weight: 70,
  height: 170,
};

/**
 * Save calorie calculator parameters to AsyncStorage
 */
export const saveCalorieCalculatorParams = async (
  params: CalorieIntakeParams
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      CALORIE_CALCULATOR_PARAMS_KEY,
      JSON.stringify(params)
    );
  } catch (error) {
    console.error("Error saving calorie calculator params:", error);
    throw new Error("Failed to save calorie calculator params");
  }
};

/**
 * Get calorie calculator parameters from AsyncStorage
 */
export const getCalorieCalculatorParams =
  async (): Promise<CalorieIntakeParams> => {
    try {
      const paramsJson = await AsyncStorage.getItem(
        CALORIE_CALCULATOR_PARAMS_KEY
      );
      if (!paramsJson) {
        return DEFAULT_CALORIE_CALCULATOR_PARAMS;
      }
      return JSON.parse(paramsJson) as CalorieIntakeParams;
    } catch (error) {
      console.error("Error getting calorie calculator params:", error);
      return DEFAULT_CALORIE_CALCULATOR_PARAMS;
    }
  };

/**
 * Save protein calculator body weight to AsyncStorage
 */
// Deprecated: Protein calculator now uses shared calorie calculator params' weight

/**
 * Get protein calculator body weight from AsyncStorage
 */
// Deprecated: Protein calculator now uses shared calorie calculator params' weight

/**
 * Favorites storage helpers
 */

export const getFavoriteEntries = async (): Promise<FavoriteEntry[]> => {
  try {
    const json = await AsyncStorage.getItem(FAVORITE_ENTRIES_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed as FavoriteEntry[];
    }
    return [];
  } catch (error) {
    console.error("Error getting favorite entries:", error);
    return [];
  }
};

export const saveFavoriteEntries = async (
  entries: FavoriteEntry[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITE_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving favorite entries:", error);
    throw new Error("Failed to save favorite entries");
  }
};

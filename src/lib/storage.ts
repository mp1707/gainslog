import AsyncStorage from "@react-native-async-storage/async-storage";
import { FoodLog, DailyTargets } from "../types";

const FOOD_LOGS_KEY = "food_logs";
const DAILY_TARGETS_KEY = "daily_targets";

const VISIBLE_NUTRITION_KEYS_KEY = "visible_nutrition_keys";

// Default visible nutrition keys
export const DEFAULT_VISIBLE_NUTRITION_KEYS: Array<
  "calories" | "protein" | "carbs" | "fat"
> = ["protein", "carbs", "fat", "calories"];

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

/**
 * Save visible nutrition keys to AsyncStorage
 */
export const saveVisibleNutritionKeys = async (
  keys: Array<"calories" | "protein" | "carbs" | "fat">
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      VISIBLE_NUTRITION_KEYS_KEY,
      JSON.stringify(keys)
    );
  } catch (error) {
    console.error("Error saving visible nutrition keys:", error);
    throw new Error("Failed to save visible nutrition keys");
  }
};

/**
 * Get visible nutrition keys from AsyncStorage
 */
export const getVisibleNutritionKeys = async (): Promise<
  Array<"calories" | "protein" | "carbs" | "fat">
> => {
  try {
    const keysJson = await AsyncStorage.getItem(VISIBLE_NUTRITION_KEYS_KEY);
    if (!keysJson) {
      return DEFAULT_VISIBLE_NUTRITION_KEYS;
    }
    return JSON.parse(keysJson) as Array<
      "calories" | "protein" | "carbs" | "fat"
    >;
  } catch (error) {
    console.error("Error getting visible nutrition keys:", error);
    return DEFAULT_VISIBLE_NUTRITION_KEYS;
  }
};

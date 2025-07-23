import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodLog } from '../types';

const FOOD_LOGS_KEY = 'food_logs';

/**
 * Save a food log to AsyncStorage
 */
export const saveFoodLog = async (foodLog: FoodLog): Promise<void> => {
  try {
    const existingLogs = await getFoodLogs();
    
    // Check if log with same ID already exists
    const existingLogIndex = existingLogs.findIndex(log => log.id === foodLog.id);
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
    console.error('Error saving food log:', error);
    throw new Error('Failed to save food log');
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
    console.error('Error getting food logs:', error);
    return [];
  }
};

/**
 * Update an existing food log
 */
export const updateFoodLog = async (updatedLog: FoodLog): Promise<void> => {
  try {
    const existingLogs = await getFoodLogs();
    const updatedLogs = existingLogs.map(log => 
      log.id === updatedLog.id ? updatedLog : log
    );
    await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error updating food log:', error);
    throw new Error('Failed to update food log');
  }
};

/**
 * Delete a food log by ID
 */
export const deleteFoodLog = async (id: string): Promise<void> => {
  try {
    const existingLogs = await getFoodLogs();
    const filteredLogs = existingLogs.filter(log => log.id !== id);
    await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(filteredLogs));
  } catch (error) {
    console.error('Error deleting food log:', error);
    throw new Error('Failed to delete food log');
  }
};

/**
 * Clear all food logs (useful for testing or reset)
 */
export const clearAllFoodLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FOOD_LOGS_KEY);
  } catch (error) {
    console.error('Error clearing food logs:', error);
    throw new Error('Failed to clear food logs');
  }
};

/**
 * Generate a unique ID for food logs
 */
export const generateFoodLogId = (): string => {
  return `food_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
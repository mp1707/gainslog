// store/selectors.ts

import { AppState } from "@/store/useAppStore";
import type { FoodLog } from "../types/models"; // Adjust path if needed

/**
 * ## Basic Selectors
 * These are the fundamental building blocks for getting slices of state.
 */

/**
 * Selects all food logs for a specific day.
 * @param date - The date string in "YYYY-MM-DD" format.
 * @returns An array of food logs for that day.
 */
export const selectLogsForDate = (state: AppState, date: string): FoodLog[] =>
  state.foodLogs.filter((log) => log.logDate === date);

/**
 * ## Computed Selectors
 * These selectors perform calculations on the state.
 */

/**
 * Calculates the total sum of calories, protein, carbs, and fat for a given day.
 * @param date - The date string in "YYYY-MM-DD" format.
 * @returns An object containing the summed totals.
 */
export const selectDailyTotals = (state: AppState, date: string) => {
  // Reuse the basic selector to get the relevant logs first
  const logsForDay = selectLogsForDate(state, date);

  // Use reduce to sum up the values into a single object
  return logsForDay.reduce(
    (totals, log) => {
      totals.calories += log.calories || 0;
      totals.protein += log.protein || 0;
      totals.carbs += log.carbs || 0;
      totals.fat += log.fat || 0;
      return totals;
    },
    // The starting value for our totals object
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * Calculates the achieved percentage of daily targets for a given day.
 * If a target is not set or is 0, its percentage will be 0.
 * @param date - The date string in "YYYY-MM-DD" format.
 * @returns An object containing the nutrient percentages (0-100+).
 */
export const selectDailyPercentages = (state: AppState, date: string) => {
  // Reuse the previous selector to get the totals
  const totals = selectDailyTotals(state, date);
  const targets = state.dailyTargets;

  // A safe helper function to prevent division by zero
  const calculatePercentage = (total: number, target: number | undefined) => {
    // If target is undefined, null, or 0, the percentage is 0
    if (!target) {
      return 0;
    }
    return (total / target) * 100;
  };

  return {
    calories: calculatePercentage(totals.calories, targets?.calories),
    protein: calculatePercentage(totals.protein, targets?.protein),
    carbs: calculatePercentage(totals.carbs, targets?.carbs),
    fat: calculatePercentage(totals.fat, targets?.fat),
  };
};

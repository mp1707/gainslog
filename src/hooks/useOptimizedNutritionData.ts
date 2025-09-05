import { useMemo } from 'react';
import type { FoodLog, DailyTargets } from '@/types/models';

interface DailyNutritionData {
  [dateKey: string]: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MonthlyNutritionIndex {
  [monthKey: string]: DailyNutritionData;
}

interface NutritionPercentages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface OptimizedNutritionHookReturn {
  getDailyPercentages: (dateKey: string) => NutritionPercentages;
  isMonthCalculated: (monthKey: string) => boolean;
  getMonthNutritionData: (monthKey: string) => DailyNutritionData;
}

/**
 * Optimized nutrition data hook that only calculates data for requested months
 * and provides O(1) lookup for daily percentages
 */
export const useOptimizedNutritionData = (
  foodLogs: FoodLog[],
  dailyTargets: DailyTargets | undefined,
  relevantMonths: string[] // Array of "YYYY-MM" strings
): OptimizedNutritionHookReturn => {
  
  // Create indexed nutrition data by month for efficient lookups
  const monthlyNutritionIndex = useMemo((): MonthlyNutritionIndex => {
    const index: MonthlyNutritionIndex = {};
    
    // Initialize relevant months
    relevantMonths.forEach(monthKey => {
      index[monthKey] = {};
    });
    
    // Process food logs and group by month
    foodLogs.forEach((log: FoodLog) => {
      const monthKey = log.logDate.substring(0, 7); // Extract YYYY-MM
      
      // Only process if this month is relevant
      if (index[monthKey] !== undefined) {
        if (!index[monthKey][log.logDate]) {
          index[monthKey][log.logDate] = { 
            calories: 0, 
            protein: 0, 
            carbs: 0, 
            fat: 0 
          };
        }
        
        const dayData = index[monthKey][log.logDate];
        dayData.calories += log.calories;
        dayData.protein += log.protein;
        dayData.carbs += log.carbs;
        dayData.fat += log.fat;
      }
    });
    
    return index;
  }, [foodLogs, relevantMonths]);

  // Memoized function to get daily percentages with O(1) lookup
  const getDailyPercentages = useMemo(() => {
    return (dateKey: string): NutritionPercentages => {
      const monthKey = dateKey.substring(0, 7);
      const monthData = monthlyNutritionIndex[monthKey];
      const dayData = monthData?.[dateKey];
      
      if (!dayData || !dailyTargets) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      
      return {
        calories: dailyTargets.calories ? (dayData.calories / dailyTargets.calories) * 100 : 0,
        protein: dailyTargets.protein ? (dayData.protein / dailyTargets.protein) * 100 : 0,
        carbs: dailyTargets.carbs ? (dayData.carbs / dailyTargets.carbs) * 100 : 0,
        fat: dailyTargets.fat ? (dayData.fat / dailyTargets.fat) * 100 : 0,
      };
    };
  }, [monthlyNutritionIndex, dailyTargets]);

  // Utility functions
  const isMonthCalculated = useMemo(() => {
    return (monthKey: string): boolean => {
      return monthlyNutritionIndex[monthKey] !== undefined;
    };
  }, [monthlyNutritionIndex]);

  const getMonthNutritionData = useMemo(() => {
    return (monthKey: string): DailyNutritionData => {
      return monthlyNutritionIndex[monthKey] || {};
    };
  }, [monthlyNutritionIndex]);

  return {
    getDailyPercentages,
    isMonthCalculated,
    getMonthNutritionData,
  };
};

/**
 * Helper function to generate month keys for a range (only past and current months)
 */
export const generateMonthKeys = (
  centerYear: number, 
  centerMonth: number, 
  rangeMonths: number = 6
): string[] => {
  const months: string[] = [];
  const startDate = new Date(centerYear, centerMonth - 1 - rangeMonths, 1);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;
  
  // Only generate months up to current month (no future months)
  for (let i = 0; i < rangeMonths + 1; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // Stop if we reach a future month
    if (year > currentYear || (year === currentYear && month > currentMonthNum)) {
      break;
    }
    
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    months.push(monthKey);
  }
  
  return months;
};
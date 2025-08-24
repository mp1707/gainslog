import { useMemo } from "react";
import { useAppStore } from "@/store";

interface DailyTotalsResult {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
}

export const useDailyTotals = (date?: string): DailyTotalsResult => {
  const { selectedDate, getDailyTotals, dailyTargets } = useAppStore();
  const targetDate = date || selectedDate;

  const totals = useMemo(() => {
    return getDailyTotals(targetDate);
  }, [targetDate, getDailyTotals]);

  const progress = useMemo(() => {
    if (!dailyTargets) return null;

    return {
      calories: Math.min((totals.calories / dailyTargets.calories) * 100, 100),
      protein: Math.min((totals.protein / dailyTargets.protein) * 100, 100),
      carbs: Math.min((totals.carbs / dailyTargets.carbs) * 100, 100),
      fat: Math.min((totals.fat / dailyTargets.fat) * 100, 100),
    };
  }, [totals, dailyTargets]);

  const remaining = useMemo(() => {
    if (!dailyTargets) return null;

    return {
      calories: Math.max(dailyTargets.calories - totals.calories, 0),
      protein: Math.max(dailyTargets.protein - totals.protein, 0),
      carbs: Math.max(dailyTargets.carbs - totals.carbs, 0),
      fat: Math.max(dailyTargets.fat - totals.fat, 0),
    };
  }, [totals, dailyTargets]);

  return {
    totals,
    targets: dailyTargets,
    progress,
    remaining,
  };
};

// Hook for getting totals for multiple dates (useful for charts)
export const useMultipleDaysTotals = (dates: string[]) => {
  const { getDailyTotals } = useAppStore();

  return useMemo(() => {
    return dates.map((date) => ({
      date,
      totals: getDailyTotals(date),
    }));
  }, [dates, getDailyTotals]);
};

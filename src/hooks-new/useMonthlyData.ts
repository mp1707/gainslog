import { useMemo, useState } from "react";
import { useAppStore } from "@/store";
import { getDaysInMonth, formatDateKey } from "@/utils/dateHelpers";

interface DayData {
  date: string;
  day: number;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  hasData: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface MonthlyDataResult {
  monthData: DayData[];
  monthTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  monthAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  daysWithData: number;
  selectedMonth: { year: number; month: number };
  navigateMonth: (direction: "prev" | "next") => void;
  setMonth: (year: number, month: number) => void;
}

export const useMonthlyData = (
  initialYear?: number,
  initialMonth?: number
): MonthlyDataResult => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState({
    year: initialYear || today.getFullYear(),
    month: initialMonth || today.getMonth() + 1,
  });

  const { getDailyTotals } = useAppStore();

  const monthData = useMemo(() => {
    const { year, month } = selectedMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const todayKey = today.toISOString().split("T")[0];
    const data: DayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const totals = getDailyTotals(dateKey);
      const dayDate = new Date(year, month - 1, day);

      data.push({
        date: dateKey,
        day,
        totals,
        hasData:
          totals.calories > 0 ||
          totals.protein > 0 ||
          totals.carbs > 0 ||
          totals.fat > 0,
        isToday: dateKey === todayKey,
        isFuture: dayDate > today,
      });
    }

    return data;
  }, [selectedMonth, getDailyTotals]);

  const { monthTotals, monthAverages, daysWithData } = useMemo(() => {
    const totals = monthData.reduce(
      (acc, day) => ({
        calories: acc.calories + day.totals.calories,
        protein: acc.protein + day.totals.protein,
        carbs: acc.carbs + day.totals.carbs,
        fat: acc.fat + day.totals.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const daysWithData = monthData.filter((day) => day.hasData).length;

    const averages = {
      calories:
        daysWithData > 0 ? Math.round(totals.calories / daysWithData) : 0,
      protein: daysWithData > 0 ? Math.round(totals.protein / daysWithData) : 0,
      carbs: daysWithData > 0 ? Math.round(totals.carbs / daysWithData) : 0,
      fat: daysWithData > 0 ? Math.round(totals.fat / daysWithData) : 0,
    };

    return { monthTotals: totals, monthAverages: averages, daysWithData };
  }, [monthData]);

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth((current) => {
      let { year, month } = current;

      if (direction === "next") {
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      } else {
        month -= 1;
        if (month < 1) {
          month = 12;
          year -= 1;
        }
      }

      return { year, month };
    });
  };

  const setMonth = (year: number, month: number) => {
    setSelectedMonth({ year, month });
  };

  return {
    monthData,
    monthTotals,
    monthAverages,
    daysWithData,
    selectedMonth,
    navigateMonth,
    setMonth,
  };
};

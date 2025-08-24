import { useCallback } from "react";
import { useAppStore } from "@/store";
import {
  navigateDate,
  getTodayKey,
  isToday,
  getRelativeDate,
  formatDisplayDate,
} from "@/utils/dateHelpers";

interface DateNavigationResult {
  selectedDate: string;
  displayDate: string;
  relativeDate: string;
  canGoNext: boolean;
  goToNext: () => void;
  goToPrev: () => void;
  goToToday: () => void;
  setDate: (date: string) => void;
}

export const useDateNavigation = (): DateNavigationResult => {
  const { selectedDate, setSelectedDate } = useAppStore();

  const todayKey = getTodayKey();
  // Allow navigation forward until we reach today (inclusive)
  const canGoNext = selectedDate < todayKey;

  const goToNext = useCallback(() => {
    const nextDate = navigateDate(selectedDate, "next");
    // Only navigate if the next date is not in the future beyond today
    if (nextDate <= todayKey) {
      setSelectedDate(nextDate);
    }
  }, [selectedDate, todayKey, setSelectedDate]);

  const goToPrev = useCallback(() => {
    const prevDate = navigateDate(selectedDate, "prev");
    setSelectedDate(prevDate);
  }, [selectedDate, setSelectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(todayKey);
  }, [todayKey, setSelectedDate]);

  const setDate = useCallback(
    (date: string) => {
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  return {
    selectedDate,
    displayDate: formatDisplayDate(selectedDate),
    relativeDate: getRelativeDate(selectedDate),
    canGoNext,
    goToNext,
    goToPrev,
    goToToday,
    setDate,
  };
};

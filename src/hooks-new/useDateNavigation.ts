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
  isToday: boolean;
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
  const isTodaySelected = isToday(selectedDate);
  const canGoNext = selectedDate < todayKey;

  const goToNext = useCallback(() => {
    if (canGoNext) {
      const nextDate = navigateDate(selectedDate, "next");
      setSelectedDate(nextDate);
    }
  }, [selectedDate, canGoNext, setSelectedDate]);

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
    isToday: isTodaySelected,
    displayDate: formatDisplayDate(selectedDate),
    relativeDate: getRelativeDate(selectedDate),
    canGoNext,
    goToNext,
    goToPrev,
    goToToday,
    setDate,
  };
};

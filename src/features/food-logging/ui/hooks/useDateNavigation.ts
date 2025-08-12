import { useCallback } from "react";
import { useFoodLogStore, selectSelectedDate } from "@/stores/useFoodLogStore";

export const useDateNavigation = () => {
  const selectedDate = useFoodLogStore(selectSelectedDate);
  const setSelectedDate = useFoodLogStore((state) => state.setSelectedDate);

  // Helper function to convert Date to local date string (YYYY-MM-DD)
  const dateToLocalDateString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (selectedDate) {
        const dateString = dateToLocalDateString(selectedDate);
        setSelectedDate(dateString);
      }
    },
    [dateToLocalDateString, setSelectedDate]
  );

  const navigateToPreviousDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const dateString = dateToLocalDateString(currentDate);
    setSelectedDate(dateString);
  }, [selectedDate, dateToLocalDateString, setSelectedDate]);

  const navigateToNextDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const dateString = dateToLocalDateString(currentDate);
    setSelectedDate(dateString);
  }, [selectedDate, dateToLocalDateString, setSelectedDate]);

  // Check if the selected date is today to disable next button
  const isToday = useCallback(() => {
    const today = new Date();
    const todayString = dateToLocalDateString(today);
    return selectedDate === todayString;
  }, [selectedDate, dateToLocalDateString]);

  return {
    selectedDate,
    dateToLocalDateString,
    handleDateChange,
    navigateToPreviousDay,
    navigateToNextDay,
    isToday,
  };
};

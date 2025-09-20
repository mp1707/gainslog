import React, { useMemo } from "react";
import { View } from "react-native";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./CalendarGrid.styles";
import { CalendarDay } from "./CalendarDay";
import {
  getDaysInMonth,
  formatDateKey,
  isFutureDate,
} from "@/utils/dateHelpers";

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: string;
  getDailyPercentages: (dateKey: string) => {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  onDateSelect: (dateKey: string) => void;
  width: number;
  useSimplifiedRings?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CalendarGridComponent: React.FC<CalendarGridProps> = ({
  year,
  month,
  selectedDate,
  getDailyPercentages,
  onDateSelect,
  width,
  useSimplifiedRings = false,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
    const daysInPrevMonth = getDaysInMonth(year, month === 1 ? 12 : month - 1);

    const days: Array<{
      day: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isFuture: boolean;
    }> = [];

    // Add previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const dateKey = formatDateKey(prevYear, prevMonth, day);

      days.push({
        day,
        dateKey,
        isCurrentMonth: false,
        isSelected: false,
        isFuture: false, // Previous month days are never future
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      days.push({
        day,
        dateKey,
        isCurrentMonth: true,
        isSelected: dateKey === selectedDate,
        isFuture: isFutureDate(dateKey),
      });
    }

    // Fill remaining cells with empty placeholders (no future month days)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({
        day: 0, // Use 0 to indicate empty cell
        dateKey: "",
        isCurrentMonth: false,
        isSelected: false,
        isFuture: false,
      });
    }

    return days;
  }, [year, month, selectedDate]);

  // Create rows of 7 days each
  const rows = useMemo(() => {
    const rowsArray = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      rowsArray.push(calendarData.slice(i, i + 7));
    }
    return rowsArray;
  }, [calendarData]);

  const monthName = MONTH_NAMES[month - 1];

  return (
    <View style={[styles.container, { width }]}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <AppText role="Title2" style={styles.monthTitle}>
          {monthName} {year}
        </AppText>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((weekday) => (
          <View key={weekday} style={styles.weekdayCell}>
            <AppText role="Caption" style={styles.weekdayText}>
              {weekday}
            </AppText>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.calendarRow}>
            {row.map((dayData, index) => {
              // Skip rendering for empty cells (day === 0)
              if (dayData.day === 0) {
                return <View key={`empty-${index}`} style={{ flex: 1 }} />;
              }

              return (
                <CalendarDay
                  key={dayData.dateKey}
                  dateKey={dayData.dateKey}
                  day={dayData.day}
                  isCurrentMonth={dayData.isCurrentMonth}
                  isSelected={dayData.isSelected}
                  isFuture={dayData.isFuture}
                  percentages={getDailyPercentages(dayData.dateKey)}
                  onPress={onDateSelect}
                  useSimplifiedRings={useSimplifiedRings}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

// Memoized component with custom comparison for optimal performance
export const CalendarGrid = React.memo(
  CalendarGridComponent,
  (prevProps, nextProps) => {
    // Only re-render if essential props change
    return (
      prevProps.year === nextProps.year &&
      prevProps.month === nextProps.month &&
      prevProps.selectedDate === nextProps.selectedDate &&
      prevProps.width === nextProps.width &&
      prevProps.getDailyPercentages === nextProps.getDailyPercentages &&
      prevProps.onDateSelect === nextProps.onDateSelect &&
      prevProps.useSimplifiedRings === nextProps.useSimplifiedRings
    );
  }
);

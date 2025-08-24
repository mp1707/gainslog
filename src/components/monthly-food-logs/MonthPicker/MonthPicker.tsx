import React, { useMemo, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { useTheme } from "@/providers";
import { AppText } from "@/components/shared/AppText";
import { createStyles } from "./MonthPicker.styles";

interface MonthPickerProps {
  selectedMonth: string; // Format: YYYY-MM
  onMonthChange: (month: string) => void;
}

export function MonthPicker({
  selectedMonth,
  onMonthChange,
}: MonthPickerProps) {
  // Parse the selected month
  const [year, month] = selectedMonth.split("-").map(Number);
  const currentDate = new Date(year, month - 1);

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Format display text
  const formatMonth = useCallback((date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, []);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(year, month - 2);
    const prevMonthString = `${prevMonth.getFullYear()}-${String(
      prevMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    onMonthChange(prevMonthString);
  }, [month, onMonthChange, year]);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    const nextMonth = new Date(year, month);
    const nextMonthString = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    onMonthChange(nextMonthString);
  }, [month, onMonthChange, year]);

  // Check if we're at current month (don't allow future months)
  const currentMonth = new Date();
  const isAtCurrentMonth =
    year === currentMonth.getFullYear() &&
    month === currentMonth.getMonth() + 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navigationArrow}
        onPress={goToPreviousMonth}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        accessibilityHint="Moves selection to the previous month"
      >
        <CaretLeftIcon
          size={16}
          color={colors.secondaryText}
          weight="regular"
        />
      </TouchableOpacity>
      <View style={styles.monthTextContainer}>
        <AppText role="Headline" style={styles.monthText}>
          {formatMonth(currentDate)}
        </AppText>
      </View>

      <TouchableOpacity
        style={[
          styles.navigationArrow,
          isAtCurrentMonth && styles.navigationArrowDisabled,
        ]}
        onPress={goToNextMonth}
        disabled={isAtCurrentMonth}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        accessibilityHint={
          isAtCurrentMonth
            ? "You are at the current month; moving forward is disabled"
            : "Moves selection to the next month"
        }
        accessibilityState={{ disabled: isAtCurrentMonth }}
      >
        <CaretRightIcon
          size={16}
          color={isAtCurrentMonth ? colors.disabledText : colors.secondaryText}
          weight="regular"
        />
      </TouchableOpacity>
    </View>
  );
}

import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "../../../../providers/ThemeProvider";
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
  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const prevMonth = new Date(year, month - 2);
    const prevMonthString = `${prevMonth.getFullYear()}-${String(
      prevMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    onMonthChange(prevMonthString);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(year, month);
    const nextMonthString = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    onMonthChange(nextMonthString);
  };

  // Check if we're at current month (don't allow future months)
  const currentMonth = new Date();
  const isAtCurrentMonth =
    year === currentMonth.getFullYear() &&
    month === currentMonth.getMonth() + 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={goToPreviousMonth}
        activeOpacity={0.7}
      >
        <FontAwesome name="chevron-left" size={16} color={colors.primaryText} />
      </TouchableOpacity>

      <Text style={styles.monthText}>{formatMonth(currentDate)}</Text>

      <TouchableOpacity
        style={[styles.button, isAtCurrentMonth && styles.disabledButton]}
        onPress={goToNextMonth}
        disabled={isAtCurrentMonth}
        activeOpacity={0.7}
      >
        <FontAwesome
          name="chevron-right"
          size={16}
          color={isAtCurrentMonth ? colors.secondaryText : colors.primaryText}
        />
      </TouchableOpacity>
    </View>
  );
}

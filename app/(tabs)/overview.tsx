import React, { useEffect, useMemo } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/providers/ThemeProvider";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { DailySummaryCard } from "../../src/shared/ui/molecules/DailySummaryCard";
import { MonthPicker } from "../../src/shared/ui/molecules/MonthPicker";
import { PageHeader } from "../../src/shared/ui/molecules/PageHeader";

export default function OverviewTab() {
  const {
    selectedMonth,
    setSelectedMonth,
    dailyTargets,
    loadDailyTargets,
    getDailyTotalsForMonth,
    navigateToTodayWithDate,
  } = useFoodLogStore();

  // Load daily targets on mount
  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  const dailyTotals = getDailyTotalsForMonth();

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleDayPress = (date: string) => {
    navigateToTodayWithDate(date);
  };

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader>
        <MonthPicker
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </PageHeader>

      {dailyTotals.length === 0 ? (
        <Text style={styles.emptyText}>No food logs found for this month.</Text>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {dailyTotals.map(({ date, totals }) => (
            <DailySummaryCard
              key={date}
              date={date}
              totals={totals}
              targets={dailyTargets}
              onPress={() => handleDayPress(date)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Dynamic styles creator
function createStyles(colors: any, themeObj: any) {
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      gap: spacing.md,
    },
    emptyText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
      lineHeight: 22,
    },
  });
}

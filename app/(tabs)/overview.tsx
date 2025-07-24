import React, { useEffect } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';
import { useFoodLogStore } from '../../src/stores/useFoodLogStore';
import { DailySummaryCard } from '../../src/shared/ui/molecules/DailySummaryCard';
import { MonthPicker } from '../../src/shared/ui/molecules/MonthPicker';

export default function OverviewTab() {
  const {
    selectedMonth,
    setSelectedMonth,
    dailyTargets,
    isLoadingTargets,
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      
      <MonthPicker 
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />
      
      {dailyTotals.length === 0 ? (
        <Text style={styles.emptyText}>
          No food logs found for this month.
        </Text>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
});
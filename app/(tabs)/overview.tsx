import React, { useEffect, useMemo } from "react";
import { ScrollView, Text, StyleSheet, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  
  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };
  
  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding = tabBarHeight + theme.spacing.lg + theme.spacing.md;
  
  const styles = useMemo(() => createStyles(colors, theme, dynamicBottomPadding), [colors, theme, dynamicBottomPadding]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
function createStyles(colors: any, themeObj: any, bottomPadding?: number) {
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
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      paddingTop: spacing.md,
      paddingBottom: bottomPadding || spacing.xl,
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

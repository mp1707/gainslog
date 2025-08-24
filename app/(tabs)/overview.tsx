import React, { useCallback, useEffect, useMemo } from "react";
import {
  FlatList,
  Text,
  StyleSheet,
  Platform,
  View,
  ListRenderItem,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import {
  useFoodLogStore,
  selectSelectedMonth,
  selectDailyTargets,
  selectFoodLogs,
} from "../../src/store-legacy/useFoodLogStore";
import { DailySummaryCard } from "../../src/components/monthly-food-logs/DailySummaryCard";
import { MonthPicker } from "../../src/components/monthly-food-logs/MonthPicker";
import { PageHeader } from "../../src/components/shared/PageHeader";

export default function OverviewTab() {
  // Subscribe to only the needed slices of state with safe defaults
  const selectedMonth =
    useFoodLogStore(selectSelectedMonth) ||
    new Date().toISOString().slice(0, 7);
  const setSelectedMonth = useFoodLogStore((s) => s.setSelectedMonth);
  const dailyTargets = useFoodLogStore(selectDailyTargets) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const loadDailyTargets = useFoodLogStore((s) => s.loadDailyTargets);
  const navigateToTodayWithDate = useFoodLogStore(
    (s) => s.navigateToTodayWithDate
  );
  const foodLogs = useFoodLogStore(selectFoodLogs) || [];

  // Early return if essential data is not available
  if (!setSelectedMonth || !loadDailyTargets || !navigateToTodayWithDate) {
    return null; // or a loading spinner
  }

  // Filter logs for the current month using useMemo (fixes infinite re-render)
  const monthlyFoodLogs = useMemo(
    () =>
      foodLogs.filter((log) => log.date && log.date.startsWith(selectedMonth)),
    [foodLogs, selectedMonth]
  );

  // Load daily targets on mount
  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  // Optimized daily totals computation with better memoization
  const dailyTotals = useMemo(() => {
    if (monthlyFoodLogs.length === 0) return [];

    // Group by date using a more efficient approach
    const logsByDate = new Map<string, typeof monthlyFoodLogs>();

    for (const log of monthlyFoodLogs) {
      const existingLogs = logsByDate.get(log.date);
      if (existingLogs) {
        existingLogs.push(log);
      } else {
        logsByDate.set(log.date, [log]);
      }
    }

    // Calculate totals more efficiently
    const totals: Array<{
      date: string;
      totals: { calories: number; protein: number; carbs: number; fat: number };
    }> = [];

    for (const [date, logs] of logsByDate) {
      let calories = 0,
        protein = 0,
        carbs = 0,
        fat = 0;

      for (const log of logs) {
        calories += log.calories;
        protein += log.protein;
        carbs += log.carbs;
        fat += log.fat;
      }

      totals.push({
        date,
        totals: { calories, protein, carbs, fat },
      });
    }

    // Sort by date desc (most recent first)
    return totals.sort((a, b) => b.date.localeCompare(a.date));
  }, [monthlyFoodLogs]);

  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };

  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding =
    tabBarHeight + theme.spacing.lg + theme.spacing.md;

  const styles = useMemo(
    () => createStyles(colors, theme, dynamicBottomPadding),
    [colors, theme, dynamicBottomPadding]
  );

  // Memoized month change handler
  const handleMonthChange = useCallback(
    (month: string) => {
      setSelectedMonth(month);
    },
    [setSelectedMonth]
  );

  // Memoized day press handler
  const handleDayPress = useCallback(
    (date: string) => {
      navigateToTodayWithDate(date);
    },
    [navigateToTodayWithDate]
  );

  // Memoize transformed data with optimized calculations
  const transformedDailyData = useMemo(() => {
    if (dailyTotals.length === 0) return [];

    // Pre-calculate divisors to avoid repeated division checks
    const caloriesDivisor = dailyTargets.calories || 1;
    const proteinDivisor = dailyTargets.protein || 1;
    const carbsDivisor = dailyTargets.carbs || 1;
    const fatDivisor = dailyTargets.fat || 1;

    return dailyTotals.map(({ date, totals }) => ({
      dateIso: date,
      calories:
        dailyTargets.calories > 0
          ? Math.round((totals.calories / caloriesDivisor) * 100)
          : 0,
      protein:
        dailyTargets.protein > 0
          ? Math.round((totals.protein / proteinDivisor) * 100)
          : 0,
      carbs:
        dailyTargets.carbs > 0
          ? Math.round((totals.carbs / carbsDivisor) * 100)
          : 0,
      fat:
        dailyTargets.fat > 0 ? Math.round((totals.fat / fatDivisor) * 100) : 0,
    }));
  }, [
    dailyTotals,
    dailyTargets.calories,
    dailyTargets.protein,
    dailyTargets.carbs,
    dailyTargets.fat,
  ]);

  const renderItem = useCallback<
    ListRenderItem<{
      dateIso: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>
  >(
    ({ item, index }) => (
      <View style={styles.cardWrap}>
        <DailySummaryCard
          dateIso={item.dateIso}
          calories={item.calories}
          protein={item.protein}
          carbs={item.carbs}
          fat={item.fat}
          onPress={() => handleDayPress(item.dateIso)}
        />
      </View>
    ),
    [handleDayPress, styles.cardWrap]
  );

  const keyExtractor = useCallback((d: { dateIso: string }) => d.dateIso, []);

  // Note: Do not use getItemLayout; rows have variable height based on filters

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <PageHeader>
        <MonthPicker
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </PageHeader>

      <FlatList
        data={transformedDailyData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        // getItemLayout intentionally omitted because rows can change height
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Optimized performance settings
        initialNumToRender={5} // Reduced from 10
        maxToRenderPerBatch={5} // Reduced from 10
        updateCellsBatchingPeriod={10} // Reduced from 30
        windowSize={10} // Increased from 6
        removeClippedSubviews={true}
        // Performance optimizations
        disableIntervalMomentum={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            No food logs found for this month.
          </Text>
        )}
      />
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
    cardWrap: {
      width: "100%",
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
    legendRow: {
      width: "100%",
      gap: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    stickyHeaderSpacer: {
      height: spacing.sm,
    },
  });
}

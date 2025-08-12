import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
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
import { useTheme } from "@/providers";
import {
  useFoodLogStore,
  selectSelectedMonth,
  selectDailyTargets,
  selectFoodLogs,
} from "../../src/stores/useFoodLogStore";
import { DailySummaryCard } from "../../src/shared/ui/molecules/DailySummaryCard";
import { MonthPicker } from "../../src/shared/ui/molecules/MonthPicker";
import { PageHeader } from "../../src/shared/ui/molecules/PageHeader";
import { FilterBadge, AppText } from "src/components";

export default function OverviewTab() {
  // Subscribe to only the needed slices of state to avoid re-renders on unrelated changes
  const selectedMonth = useFoodLogStore(selectSelectedMonth);
  const setSelectedMonth = useFoodLogStore((s) => s.setSelectedMonth);
  const dailyTargets = useFoodLogStore(selectDailyTargets);
  const loadDailyTargets = useFoodLogStore((s) => s.loadDailyTargets);
  const navigateToTodayWithDate = useFoodLogStore(
    (s) => s.navigateToTodayWithDate
  );
  const foodLogs = useFoodLogStore(selectFoodLogs);

  // Load daily targets on mount
  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  // Compute daily totals for the selected month using memoization to avoid expensive recomputation
  const dailyTotals = useMemo(() => {
    // Filter logs for the selected month
    const monthlyLogs = foodLogs.filter((log) =>
      log.date.startsWith(selectedMonth)
    );

    // Group by date and sum totals
    const logsByDate = monthlyLogs.reduce((acc, log) => {
      const date = log.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {} as Record<string, typeof foodLogs>);

    const totals = Object.entries(logsByDate).map(([date, logs]) => ({
      date,
      totals: logs.reduce(
        (sum, l) => ({
          calories: sum.calories + l.calories,
          protein: sum.protein + l.protein,
          carbs: sum.carbs + l.carbs,
          fat: sum.fat + l.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    }));

    // Sort by date desc (most recent first)
    return totals.sort((a, b) => b.date.localeCompare(a.date));
  }, [foodLogs, selectedMonth]);

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

  // Animate bars only when month changes (not on initial mount)
  const [barsAnimationKey, setBarsAnimationKey] = useState<number | null>(null);
  const previousMonthRef = React.useRef<string>(selectedMonth);
  useEffect(() => {
    if (previousMonthRef.current !== selectedMonth) {
      setBarsAnimationKey((k) => (k === null ? 1 : k + 1));
      previousMonthRef.current = selectedMonth;
    }
  }, [selectedMonth]);

  // Nutrient filter state
  const [filters, setFilters] = useState({
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
  });

  // Memoized filter toggle handler to prevent unnecessary re-renders
  const handleToggleFilter = useCallback((key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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

  // Memoize transformed data to prevent recalculation on every render
  const transformedDailyData = useMemo(() => {
    return dailyTotals.map(({ date, totals }) => ({
      dateIso: date,
      calories:
        dailyTargets.calories > 0
          ? Math.round((totals.calories / dailyTargets.calories) * 100)
          : 0,
      protein:
        dailyTargets.protein > 0
          ? Math.round((totals.protein / dailyTargets.protein) * 100)
          : 0,
      carbs:
        dailyTargets.carbs > 0
          ? Math.round((totals.carbs / dailyTargets.carbs) * 100)
          : 0,
      fat:
        dailyTargets.fat > 0
          ? Math.round((totals.fat / dailyTargets.fat) * 100)
          : 0,
    }));
  }, [dailyTotals, dailyTargets]);

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
          visible={filters}
          onPress={() => handleDayPress(item.dateIso)}
          animateBars={Boolean(barsAnimationKey) && index < 10}
          animationKey={barsAnimationKey ?? undefined}
          enablePressAnimation={false}
        />
      </View>
    ),
    [filters, handleDayPress, styles.cardWrap]
  );

  const keyExtractor = useCallback((d: { dateIso: string }) => d.dateIso, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <PageHeader>
        <MonthPicker
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendRow}
        >
          <AppText role="Caption">Filter: </AppText>
          <FilterBadge
            type="calories"
            label="Calories"
            active={filters.calories}
            onToggle={() => handleToggleFilter("calories")}
          />
          <FilterBadge
            type="protein"
            label="Protein"
            active={filters.protein}
            onToggle={() => handleToggleFilter("protein")}
          />
          <FilterBadge
            type="carbs"
            label="Carbs"
            active={filters.carbs}
            onToggle={() => handleToggleFilter("carbs")}
          />
          <FilterBadge
            type="fat"
            label="Fat"
            active={filters.fat}
            onToggle={() => handleToggleFilter("fat")}
          />
        </ScrollView>
      </PageHeader>

      <FlatList
        data={transformedDailyData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={30}
        windowSize={6}
        removeClippedSubviews
        extraData={filters}
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

import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet, Platform, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "../../src/providers/ThemeProvider";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { DailySummaryCard } from "../../src/shared/ui/molecules/DailySummaryCard";
import { MonthPicker } from "../../src/shared/ui/molecules/MonthPicker";
import { PageHeader } from "../../src/shared/ui/molecules/PageHeader";
import { FilterBadge } from "@/components/FilterBadge";

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

  // Nutrient filter state
  const [filters, setFilters] = useState({
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
  });

  const handleToggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeaderSpacer} />
        {dailyTotals
          .map(({ date, totals }) => ({
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
          }))
          .map((d, idx) => (
            <View key={d.dateIso} style={styles.cardWrap}>
              <DailySummaryCard
                dateIso={d.dateIso}
                 calories={d.calories}
                 protein={d.protein}
                 carbs={d.carbs}
                 fat={d.fat}
                 visible={filters}
                onPress={() => handleDayPress(d.dateIso)}
              />
            </View>
          ))}
        {dailyTotals.length === 0 && (
          <Text style={styles.emptyText}>
            No food logs found for this month. Showing examples.
          </Text>
        )}
      </ScrollView>
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
    },
    stickyHeaderSpacer: {
      height: spacing.sm,
    },
  });
}

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  StyleSheet,
  Platform,
  View,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
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
import { AppText } from "src/components";
import { FunnelIcon } from "phosphor-react-native";

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

  // Popover animation state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuVisibility = useSharedValue(0);

  const toggleMenuOpen = useCallback(() => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      menuVisibility.value = withTiming(next ? 1 : 0, {
        duration: 180,
        easing: Easing.out(Easing.quad),
      });
      Haptics.selectionAsync();
      return next;
    });
  }, [menuVisibility]);

  // Nutrient filter state
  const [filters, setFilters] = useState({
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
  });

  // Memoized filter object for stable reference
  const memoizedFilters = useMemo(
    () => filters,
    [filters.calories, filters.protein, filters.carbs, filters.fat]
  );

  // Memoized filter toggle handler to prevent unnecessary re-renders
  const handleToggleFilter = useCallback((key: keyof typeof filters) => {
    Haptics.selectionAsync();
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
          visible={memoizedFilters}
          onPress={() => handleDayPress(item.dateIso)}
        />
      </View>
    ),
    [memoizedFilters, handleDayPress, styles.cardWrap]
  );

  const keyExtractor = useCallback((d: { dateIso: string }) => d.dateIso, []);

  // Note: Do not use getItemLayout; rows have variable height based on filters

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <PageHeader>
        <View style={styles.headerRow}>
          <MonthPicker
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          <TouchableOpacity
            onPress={toggleMenuOpen}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle details menu"
            style={styles.filterButton}
          >
            <FunnelIcon
              size={22}
              color={colors.accent}
              weight={isMenuOpen ? "fill" : "regular"}
            />
          </TouchableOpacity>
        </View>

        {/* Animated non-modal popover */}
        <Animated.View
          style={[
            styles.popover,
            useAnimatedStyle(() => ({
              opacity: menuVisibility.value,
              transform: [
                {
                  scale: withTiming(menuVisibility.value ? 1 : 0.95, {
                    duration: 180,
                    easing: Easing.out(Easing.quad),
                  }),
                },
              ],
            })),
          ]}
          pointerEvents={isMenuOpen ? "auto" : "none"}
        >
          <AppText role="Headline" style={styles.popoverTitle}>
            Toggle Details
          </AppText>

          <View style={styles.menuItemRow}>
            <AppText role="Body" style={styles.menuItemLabel}>
              Calories
            </AppText>
            <TouchableOpacity
              onPress={() => handleToggleFilter("calories")}
              accessibilityRole="switch"
              accessibilityState={{ checked: filters.calories }}
              style={[
                styles.switchTrack,
                !filters.calories && styles.switchTrackOff,
              ]}
            >
              <Animated.View
                style={[
                  styles.switchThumb,
                  filters.calories
                    ? styles.switchThumbOn
                    : styles.switchThumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.menuItemRow}>
            <AppText role="Body" style={styles.menuItemLabel}>
              Protein
            </AppText>
            <TouchableOpacity
              onPress={() => handleToggleFilter("protein")}
              accessibilityRole="switch"
              accessibilityState={{ checked: filters.protein }}
              style={[
                styles.switchTrack,
                !filters.protein && styles.switchTrackOff,
              ]}
            >
              <Animated.View
                style={[
                  styles.switchThumb,
                  filters.protein
                    ? styles.switchThumbOn
                    : styles.switchThumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.menuItemRow}>
            <AppText role="Body" style={styles.menuItemLabel}>
              Carbs
            </AppText>
            <TouchableOpacity
              onPress={() => handleToggleFilter("carbs")}
              accessibilityRole="switch"
              accessibilityState={{ checked: filters.carbs }}
              style={[
                styles.switchTrack,
                !filters.carbs && styles.switchTrackOff,
              ]}
            >
              <Animated.View
                style={[
                  styles.switchThumb,
                  filters.carbs ? styles.switchThumbOn : styles.switchThumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.menuItemRow}>
            <AppText role="Body" style={styles.menuItemLabel}>
              Fat
            </AppText>
            <TouchableOpacity
              onPress={() => handleToggleFilter("fat")}
              accessibilityRole="switch"
              accessibilityState={{ checked: filters.fat }}
              style={[
                styles.switchTrack,
                !filters.fat && styles.switchTrackOff,
              ]}
            >
              <Animated.View
                style={[
                  styles.switchThumb,
                  filters.fat ? styles.switchThumbOn : styles.switchThumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
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
        extraData={memoizedFilters}
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
    headerRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    filterButton: {
      height: 40,
      width: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.iconBadges?.background || colors.disabledBackground,
    },
    popover: {
      position: "absolute",
      right: spacing.pageMargins.horizontal,
      top: spacing.md + 44, // below the header row
      backgroundColor: colors.secondaryBackground,
      borderRadius: 20,
      padding: spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      width: 240,
      gap: spacing.sm,
      zIndex: 200,
      elevation: 8,
    },
    popoverTitle: {
      marginBottom: spacing.xs,
    },
    menuItemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    menuItemLabel: {
      color: colors.primaryText,
    },
    switchTrack: {
      width: 48,
      height: 28,
      borderRadius: 16,
      backgroundColor: colors.accent,
      padding: 3,
      justifyContent: "center",
    },
    switchTrackOff: {
      backgroundColor: colors.disabledBackground,
    },
    switchThumb: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.white,
      transform: [{ translateX: 20 }],
    },
    switchThumbOff: {
      transform: [{ translateX: 0 }],
    },
    switchThumbOn: {
      transform: [{ translateX: 20 }],
    },
  });
}

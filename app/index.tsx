import {
  StyleSheet,
  View,
} from "react-native";
import React, { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import {
  selectLogsForDate,
  selectDailyTotals,
  selectDailyPercentages,
} from "@/store/selectors";
import { useTheme } from "@/theme/ThemeProvider";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { DateSlider } from "@/components/shared/DateSlider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { FoodLogsList } from "@/components/daily-food-logs/FoodLogsList";
import {
  createLogAgainHandler,
  createSaveToFavoritesHandler,
  createRemoveFromFavoritesHandler,
  createEditHandler,
  createDeleteHandler,
  createToggleFavoriteHandler,
} from "@/utils/foodLogHandlers";

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, colorScheme, theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Dynamic header height calculation using 8pt grid system
  const headerHeight = useMemo(() =>
    theme.layout.calculateHeaderHeight(insets.top),
    [theme.layout, insets.top]
  );

  // Content offset calculation for glass effect positioning
  const contentOffset = useMemo(() =>
    theme.layout.calculateContentOffset(headerHeight),
    [theme.layout, headerHeight]
  );

  const styles = useMemo(() => createStyles(colors, headerHeight), [colors, headerHeight]);
  const transparentBackground = colors.primaryBackground + "00";

  // Get the entire state for selectors and individual functions
  const state = useAppStore();
  const {
    deleteFoodLog,
    addFavorite,
    deleteFavorite,
    favorites,
    addFoodLog,
    selectedDate,
  } = state;

  const todayFoodLogs = useMemo(() => {
    return selectLogsForDate(state, state.selectedDate).reverse();
  }, [state.foodLogs, state.selectedDate]);

  const dailyTotals = useMemo(() => {
    return selectDailyTotals(state, state.selectedDate);
  }, [state.foodLogs, state.selectedDate]);

  const dailyPercentages = useMemo(() => {
    return selectDailyPercentages(state, state.selectedDate);
  }, [state.foodLogs, state.selectedDate, state.dailyTargets]);

  // Create handler functions using utilities
  const handleLogAgain = useMemo(
    () => createLogAgainHandler(addFoodLog, selectedDate),
    [addFoodLog, selectedDate]
  );

  const handleSaveToFavorites = useMemo(
    () => createSaveToFavoritesHandler(addFavorite, favorites),
    [addFavorite, favorites]
  );

  const handleRemoveFromFavorites = useMemo(
    () => createRemoveFromFavoritesHandler(deleteFavorite, favorites),
    [deleteFavorite, favorites]
  );

  const handleEdit = useMemo(
    () => createEditHandler(safeNavigate),
    [safeNavigate]
  );

  const handleDelete = useMemo(
    () => createDeleteHandler(deleteFoodLog),
    [deleteFoodLog]
  );

  const handleToggleFavorite = useMemo(
    () => createToggleFavoriteHandler(addFavorite, deleteFavorite, favorites),
    [addFavorite, deleteFavorite, favorites]
  );

  return (
    <View style={styles.container}>
      <FoodLogsList
        foodLogs={todayFoodLogs}
        dailyPercentages={dailyPercentages}
        dailyTargets={state.dailyTargets}
        dailyTotals={dailyTotals}
        dynamicBottomPadding={dynamicBottomPadding}
        headerOffset={contentOffset}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onEdit={handleEdit}
        onLogAgain={handleLogAgain}
        onSaveToFavorites={handleSaveToFavorites}
        onRemoveFromFavorites={handleRemoveFromFavorites}
      />
      <LinearGradient
        colors={[colors.primaryBackground, transparentBackground]}
        locations={[0.65, 1]}
        style={[styles.gradientOverlay, { height: headerHeight }]}
        pointerEvents="none"
      />
      <MaskedView
        style={[styles.headerWrapper, { height: headerHeight }]}
        maskElement={
          <LinearGradient
            colors={[
              colors.secondaryBackground,
              colors.secondaryBackground,
              "transparent",
            ]}
            locations={[0, 0.7, 1]}
            style={{ flex: 1 }}
          />
        }
      >
        <BlurView
          intensity={20}
          tint={colorScheme}
          style={styles.blurContainer}
        >
          <View style={{ paddingTop: insets.top }}>
            <DateSlider />
          </View>
        </BlurView>
      </MaskedView>
    </View>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];

const createStyles = (colors: Colors, _headerHeight: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    headerWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      // Height is set dynamically via headerHeight prop
      zIndex: 2,
    },
    gradientOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      // Height is set dynamically via headerHeight prop
      opacity: 0.6,
      zIndex: 1,
    },
    blurContainer: {
      flex: 1,
    },
  });
};

import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { selectDailyData } from "@/store/selectors";
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
// TODO: RevenueCat - Uncomment when configured at Apple & RevenueCat
// import Purchases from "react-native-purchases";

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, colorScheme, theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Dynamic header height calculation using 8pt grid system
  const headerHeight = useMemo(
    () => theme.layout.calculateHeaderHeight(insets.top),
    [theme.layout, insets.top]
  );

  // Content offset calculation for glass effect positioning
  const contentOffset = useMemo(
    () => theme.layout.calculateContentOffset(headerHeight),
    [theme.layout, headerHeight]
  );

  const styles = useMemo(
    () => createStyles(colors, headerHeight),
    [colors, headerHeight]
  );
  const transparentBackground = colors.primaryBackground + "00";

  // Optimized store subscriptions: only subscribe to what we need
  // This prevents re-renders when unrelated state changes (e.g., userSettings)
  const foodLogs = useAppStore((state) => state.foodLogs);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);
  const favorites = useAppStore((state) => state.favorites);
  const deleteFoodLog = useAppStore((state) => state.deleteFoodLog);
  const addFavorite = useAppStore((state) => state.addFavorite);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);
  const addFoodLog = useAppStore((state) => state.addFoodLog);

  // Create a minimal state object for selectors
  const state = { foodLogs, selectedDate, dailyTargets };

  // Optimized: single selector call replaces 3 separate calls
  const dailyData = useMemo(() => {
    return selectDailyData(state, selectedDate);
  }, [foodLogs, selectedDate, dailyTargets]);

  const todayFoodLogs = useMemo(() => {
    return dailyData.logs.reverse();
  }, [dailyData.logs]);

  const dailyTotals = dailyData.totals;
  const dailyPercentages = dailyData.percentages;

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
        locations={[0.75, 1]}
        style={[styles.gradientOverlay, { height: headerHeight }]}
        pointerEvents="none"
      />
      <MaskedView
        style={[styles.headerWrapper, { height: headerHeight }]}
        pointerEvents="box-none"
        maskElement={
          <LinearGradient
            colors={[
              colors.primaryBackground,
              colors.primaryBackground,
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
          pointerEvents="box-none"
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
      opacity: 0.8,
      zIndex: 1,
    },
    blurContainer: {
      flex: 1,
    },
  });
};

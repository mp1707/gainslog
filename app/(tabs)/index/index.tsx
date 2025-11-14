import React, { useMemo, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { selectDailyData } from "@/store/selectors";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { FoodLogsList } from "@/components/daily-food-logs/FoodLogsList";
import { useTheme, Colors } from "@/theme";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  createLogAgainHandler,
  createSaveToFavoritesHandler,
  createRemoveFromFavoritesHandler,
  createEditHandler,
  createDeleteHandler,
  createToggleFavoriteHandler,
} from "@/utils/foodLogHandlers";
import { useSegments } from "expo-router";
import { useTranslation } from "react-i18next";
import { WelcomeScreen } from "@/components/welcome";
import { hasNoDailyTargets } from "@/utils/dailyTargets";
import { Image } from "expo-image";

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const foodLogs = useAppStore((state) => state.foodLogs);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);
  const favorites = useAppStore((state) => state.favorites);
  const deleteFoodLog = useAppStore((state) => state.deleteFoodLog);
  const addFavorite = useAppStore((state) => state.addFavorite);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);
  const addFoodLog = useAppStore((state) => state.addFoodLog);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // render food logs only if main tab is focused
  const segment = useSegments();
  const screen = segment[segment.length - 1];
  const homeTabScreens = ["index", "[id]", "new", "(tabs)"];
  const isOnHomeTab = homeTabScreens.includes(screen);

  // Create a minimal state object for selectors
  const state = { foodLogs, selectedDate, dailyTargets };

  // Optimized: single selector call replaces 3 separate calls
  const dailyData = useMemo(() => {
    return selectDailyData(state, selectedDate);
  }, [foodLogs, selectedDate, dailyTargets]);

  const todayFoodLogs = useMemo(() => {
    return [...dailyData.logs].reverse();
  }, [dailyData.logs]);

  const dailyTotals = dailyData.totals;
  const dailyPercentages = dailyData.percentages;

  // Create handler functions using utilities
  const handleLogAgain = useMemo(
    () => createLogAgainHandler(addFoodLog, selectedDate),
    [addFoodLog, selectedDate]
  );

  const handleSaveToFavorites = useMemo(
    () => createSaveToFavoritesHandler(addFavorite, favorites, t),
    [addFavorite, favorites, t]
  );

  const handleRemoveFromFavorites = useMemo(
    () => createRemoveFromFavoritesHandler(deleteFavorite, favorites, t),
    [deleteFavorite, favorites, t]
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
    () =>
      createToggleFavoriteHandler(addFavorite, deleteFavorite, favorites, t),
    [addFavorite, deleteFavorite, favorites, t]
  );

  // Periodic memory cache cleanup to prevent buildup during extended use
  useEffect(() => {
    if (!isOnHomeTab) return;

    const interval = setInterval(() => {
      // Clear memory cache every 2 minutes when on home tab
      Image.clearMemoryCache();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isOnHomeTab]);

  // Show welcome screen for first-time users without daily targets
  if (hasNoDailyTargets(dailyTargets)) {
    return <WelcomeScreen />;
  }

  return (
    <FoodLogsList
      foodLogs={todayFoodLogs}
      dailyPercentages={dailyPercentages}
      dailyTargets={state.dailyTargets}
      dailyTotals={dailyTotals}
      dynamicBottomPadding={dynamicBottomPadding}
      headerOffset={headerHeight}
      onDelete={handleDelete}
      onToggleFavorite={handleToggleFavorite}
      onEdit={handleEdit}
      onLogAgain={handleLogAgain}
      onSaveToFavorites={handleSaveToFavorites}
      onRemoveFromFavorites={handleRemoveFromFavorites}
      shouldRenderFoodLogs={isOnHomeTab}
    />
  );
}

const createStyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
  });
};

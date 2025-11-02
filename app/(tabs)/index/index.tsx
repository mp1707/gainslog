import React, { useCallback, useMemo, useState } from "react";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { selectDailyData } from "@/store/selectors";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { FoodLogsList } from "@/components/daily-food-logs/FoodLogsList";
import {
  createLogAgainHandler,
  createSaveToFavoritesHandler,
  createRemoveFromFavoritesHandler,
  createEditHandler,
  createDeleteHandler,
  createToggleFavoriteHandler,
} from "@/utils/foodLogHandlers";
import { useFocusEffect, useSegments } from "expo-router";

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();

  const foodLogs = useAppStore((state) => state.foodLogs);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);
  const favorites = useAppStore((state) => state.favorites);
  const deleteFoodLog = useAppStore((state) => state.deleteFoodLog);
  const addFavorite = useAppStore((state) => state.addFavorite);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);
  const addFoodLog = useAppStore((state) => state.addFoodLog);

  // render food logs only if main tab is focused
  const segment = useSegments();
  const screen = segment[segment.length - 1];
  const homeTabScreens = ["index", "[id]", "new"];
  const isOnHomeTab = homeTabScreens.includes(screen);

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
    <FoodLogsList
      foodLogs={todayFoodLogs}
      dailyPercentages={dailyPercentages}
      dailyTargets={state.dailyTargets}
      dailyTotals={dailyTotals}
      dynamicBottomPadding={dynamicBottomPadding}
      selectedDate={selectedDate}
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

import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { selectDailyData } from "@/store/selectors";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { FoodLogsList } from "@/components/daily-food-logs/FoodLogsList";
import { DateSlider } from "@/components/shared/DateSlider";
import { useTheme, Colors, Theme } from "@/theme";
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
import { HeaderButton } from "@/components/shared/HeaderButton";
import * as Haptics from "expo-haptics";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, colorScheme, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const hasLiquidGlass = isLiquidGlassAvailable();

  const foodLogs = useAppStore((state) => state.foodLogs);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);
  const favorites = useAppStore((state) => state.favorites);
  const deleteFoodLog = useAppStore((state) => state.deleteFoodLog);
  const addFavorite = useAppStore((state) => state.addFavorite);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);
  const addFoodLog = useAppStore((state) => state.addFoodLog);

  // Dynamic header height calculation
  const headerHeight = useMemo(
    () => theme.layout.calculateHeaderHeight(insets.top),
    [theme.layout, insets.top]
  );

  const styles = useMemo(
    () => createStyles(colors, headerHeight, theme),
    [colors, headerHeight, theme]
  );

  const transparentBackground = colors.primaryBackground + "00";

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
  const handleNewPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/new");
  };
  // Show welcome screen for first-time users without daily targets
  if (hasNoDailyTargets(dailyTargets)) {
    return <WelcomeScreen />;
  }

  return (
    <View style={styles.container}>
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

      {/* Gradient overlay */}
      <LinearGradient
        colors={[colors.primaryBackground, transparentBackground]}
        locations={[0.75, 1]}
        style={[styles.gradientOverlay, { height: headerHeight + 16 }]}
        pointerEvents="none"
      />

      {/* Blur background with fade mask - WITHOUT DateSlider */}
      <MaskedView
        style={[styles.blurWrapper, { height: headerHeight + 16 }]}
        pointerEvents="none"
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
          pointerEvents="none"
        />
      </MaskedView>

      {/* DateSlider on top - NOT masked */}
      <View
        style={[styles.dateSliderWrapper, { height: headerHeight }]}
        pointerEvents="box-none"
      >
        <View style={{ paddingTop: insets.top }}>
          <DateSlider />
        </View>
      </View>
      {/* {hasLiquidGlass && (
        <View style={styles.primaryButtonContainer}>
          <HeaderButton
            variant="colored"
            size="large"
            buttonProps={{
              onPress: handleNewPress,
              color: colorScheme === "dark" ? "44EBD499" : colors.accent,
            }}
            imageProps={{
              systemName: "plus",
              color: colors.primaryText,
            }}
          />
        </View>
      )} */}
    </View>
  );
}

const createStyles = (colors: Colors, _headerHeight: number, theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    blurWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    },
    gradientOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      opacity: 0.8,
      zIndex: 1,
    },
    blurContainer: {
      flex: 1,
    },
    dateSliderWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 3,
    },
    primaryButtonContainer: {
      position: "absolute",
      bottom: 120,
      right: theme.spacing.xxl + 10,
      // left: theme.spacing.xl,
      alignItems: "center",
    },
  });
};

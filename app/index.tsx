import {
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import React, { useMemo } from "react";
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

const HEADER_HEIGHT = 265;
const DASHBOARD_OFFSET = HEADER_HEIGHT - 50;

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const handleGoalsPress = () => {
    safeNavigate("/Goals");
  };

  return (
    <View style={styles.container}>
      <FoodLogsList
        foodLogs={todayFoodLogs}
        dailyPercentages={dailyPercentages}
        dailyTargets={state.dailyTargets}
        dailyTotals={dailyTotals}
        dynamicBottomPadding={dynamicBottomPadding}
        headerOffset={DASHBOARD_OFFSET}
        onGoalsPress={handleGoalsPress}
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
        style={styles.gradientOverlay}
        pointerEvents="none"
      />
      <MaskedView
        style={styles.headerWrapper}
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
          <SafeAreaView>
            <DateSlider />
          </SafeAreaView>
        </BlurView>
      </MaskedView>
    </View>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors) => {
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
      height: HEADER_HEIGHT,
      zIndex: 12,
    },
    gradientOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      opacity: 0.6,
      zIndex: 11,
    },
    blurContainer: {
      flex: 1,
    },
  });
};

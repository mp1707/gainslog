import {
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  ListRenderItem,
} from "react-native";
import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import {
  selectLogsForDate,
  selectDailyTotals,
  selectDailyPercentages,
} from "@/store/selectors";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { useTheme } from "@/theme/ThemeProvider";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { FoodLog } from "@/types/models";
import { showFavoriteAddedToast, showFavoriteRemovedToast } from "@/lib/toast";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { NutrientSummary } from "@/components/daily-food-logs/NutrientSummary/NutrientSummary";
import { EmptyFoodLogsState } from "@/components/daily-food-logs/EmptyFoodLogsState";
import { DateSlider } from "@/components/shared/DateSlider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { generateFoodLogId } from "@/utils/idGenerator";

const HEADER_HEIGHT = 265;
const DASHBOARD_OFFSET = HEADER_HEIGHT - 50;

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const transparentBackground = colors.primaryBackground + "00";

  const flatListRef = useRef<FlatList>(null);
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
  // Note: navigation lock is handled by the edit modal lifecycle

  const todayFoodLogs = useMemo(() => {
    return selectLogsForDate(state, state.selectedDate).reverse();
  }, [state.foodLogs, state.selectedDate]);

  const dailyTotals = useMemo(() => {
    return selectDailyTotals(state, state.selectedDate);
  }, [state.foodLogs, state.selectedDate]);

  const dailyPercentages = useMemo(() => {
    return selectDailyPercentages(state, state.selectedDate);
  }, [state.foodLogs, state.selectedDate, state.dailyTargets]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [todayFoodLogs.length]);

  const defaultTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const toggleFavorite = useCallback(
    (foodLog: FoodLog) => {
      const isFavorite = favorites.some(
        (favorite) => favorite.id === foodLog.id
      );
      if (isFavorite) {
        deleteFavorite(foodLog.id);
        showFavoriteRemovedToast("Removed from favorites", foodLog.title);
      } else {
        addFavorite({ ...foodLog });
        showFavoriteAddedToast("Added to favorites", foodLog.title);
      }
    },
    [favorites, addFavorite, deleteFavorite]
  );

  const handleNavigateToDetailPage = (foodLog: FoodLog) => {
    safeNavigate(`/edit/${foodLog.id}`);
  };

  const keyExtractor = useCallback((item: FoodLog) => item.id, []);
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 120, // Estimated LogCard height including gap
      offset: 120 * index,
      index,
    }),
    []
  );

  const renderItem: ListRenderItem<FoodLog> = useCallback(
    ({ item }) => (
      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <SwipeToFunctions
          onDelete={() => deleteFoodLog(item.id)}
          onFavorite={() => toggleFavorite(item)}
          onTap={() => handleNavigateToDetailPage(item)}
        >
          <LogCard
            foodLog={item}
            isLoading={item.isEstimating}
            onLogAgain={(log) => {
              const now = new Date().toISOString();
              addFoodLog({
                id: generateFoodLogId(),
                logDate: selectedDate,
                createdAt: now,
                title: log.title,
                description: log.description,
                foodComponents: log.foodComponents,
                calories: log.calories,
                protein: log.protein,
                carbs: log.carbs,
                fat: log.fat,
                estimationConfidence: 100,
                isEstimating: false,
              });
            }}
            onSaveToFavorites={(log) => {
              const already = favorites.some((f) => f.id === log.id);
              if (already) return; // guard against duplicates
              addFavorite({
                id: log.id,
                title: log.title,
                description: log.description,
                calories: log.calories,
                protein: log.protein,
                carbs: log.carbs,
                fat: log.fat,
                foodComponents: log.foodComponents,
              });
              showFavoriteAddedToast("Added to favorites", log.title);
            }}
            onRemoveFromFavorites={(log) => {
              const exists = favorites.some((f) => f.id === log.id);
              if (!exists) return; // nothing to remove
              deleteFavorite(log.id);
              showFavoriteRemovedToast("Removed from favorites", log.title);
            }}
            onEdit={(log) => handleNavigateToDetailPage(log as FoodLog)}
            onDelete={(log) => deleteFoodLog((log as FoodLog).id)}
          />
        </SwipeToFunctions>
      </View>
    ),
    [
      deleteFoodLog,
      toggleFavorite,
      handleNavigateToDetailPage,
      theme.spacing.md,
      addFoodLog,
      favorites,
      addFavorite,
      deleteFavorite,
      selectedDate,
    ]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={todayFoodLogs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        style={styles.fullScreenScrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: dynamicBottomPadding,
            marginTop: DASHBOARD_OFFSET,
          },
        ]}
        ListHeaderComponent={
          todayFoodLogs.length > 0 ? (
            <View>
              <NutrientSummary
                percentages={dailyPercentages}
                targets={state.dailyTargets || defaultTargets}
                totals={dailyTotals}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyFoodLogsState />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        updateCellsBatchingPeriod={50}
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

const createStyles = (colors: Colors, themeObj: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    fullScreenScrollView: {
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
    headerContainer: {
      height: HEADER_HEIGHT,
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
    scrollView: {
      paddingVertical: themeObj.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: themeObj.spacing.md,
    },
    logsTitle: {
      paddingHorizontal: themeObj.spacing.md,
      marginTop: themeObj.spacing.lg,
      marginBottom: themeObj.spacing.sm,

      // --- NEW HIERARCHY STYLES ---
      ...themeObj.typography.Caption, // Use a smaller typography preset
      fontWeight: "600",
      color: colors.secondaryText,
      textTransform: "uppercase", // The key change for the "eyebrow" style
    },
  });
};

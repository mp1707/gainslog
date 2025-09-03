import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { useTheme } from "@/theme/ThemeProvider";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { FoodLog } from "@/types/models";
import { Toast } from "toastify-react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { NutrientSummary } from "@/components/daily-food-logs/NutrientSummary/NutrientSummary";
import { DateSlider } from "@/components/shared/DateSlider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

const HEADER_HEIGHT = 265;
const DASHBOARD_OFFSET = HEADER_HEIGHT - 50;

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const transparentBackground = colors.primaryBackground + "00";

  const flatListRef = useRef<FlatList>(null);

  const {
    foodLogs,
    selectedDate,
    dailyTargets,
    deleteFoodLog,
    addFavorite,
    deleteFavorite,
    favorites,
  } = useAppStore();

  const todayFoodLogs = useMemo(() => {
    return foodLogs.filter((log) => log.logDate === selectedDate).reverse();
  }, [foodLogs, selectedDate]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [todayFoodLogs.length]);

  const dailyTotals = useMemo(() => {
    return todayFoodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayFoodLogs]);

  const dailyPercentages = useMemo(() => {
    if (
      !dailyTargets ||
      !dailyTargets.calories ||
      !dailyTargets.protein ||
      !dailyTargets.carbs ||
      !dailyTargets.fat
    ) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return {
      calories: (dailyTotals.calories / dailyTargets.calories) * 100,
      protein: (dailyTotals.protein / dailyTargets.protein) * 100,
      carbs: (dailyTotals.carbs / dailyTargets.carbs) * 100,
      fat: (dailyTotals.fat / dailyTargets.fat) * 100,
    };
  }, [dailyTotals, dailyTargets]);

  const defaultTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const toggleFavorite = useCallback(
    (foodLog: FoodLog) => {
      const isFavorite = favorites.some(
        (favorite) => favorite.id === foodLog.id
      );
      if (isFavorite) {
        deleteFavorite(foodLog.id);
        Toast.error("Favorite removed");
      } else {
        addFavorite({ ...foodLog });
        Toast.success("Favorite added");
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
          <LogCard foodLog={item} isLoading={item.isEstimating} />
        </SwipeToFunctions>
      </View>
    ),
    [
      deleteFoodLog,
      toggleFavorite,
      handleNavigateToDetailPage,
      theme.spacing.md,
    ]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <View>
            <NutrientSummary
              percentages={dailyPercentages}
              targets={dailyTargets || defaultTargets}
              totals={dailyTotals}
            />
          </View>
        }
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
    </GestureHandlerRootView>
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

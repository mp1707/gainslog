import React, { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { DateNavigationHeader } from "@/components/daily-food-logs/DateNavigationHeader";
import { NutrientSummary } from "@/components/daily-food-logs/NutrientSummary";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { useTheme } from "@/theme/ThemeProvider";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { FoodLog } from "@/types/models";
import { Toast } from "toastify-react-native";

export default function TodayTab() {
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
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

  const dailyTotals = useMemo(() => {
    return todayFoodLogs.reduce(
      (acc, log) => {
        return {
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat,
        };
      },
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

  const defaultTargets = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  const toggleFavorite = (foodLog: FoodLog) => {
    const isFavorite = favorites.some((favorite) => favorite.id === foodLog.id);
    if (isFavorite) {
      deleteFavorite(foodLog.id);
      Toast.error("Favorite removed");
    } else {
      addFavorite({
        id: foodLog.id,
        title: foodLog.title,
        description: foodLog.description,
        imageUrl: foodLog.imageUrl,
        calories: foodLog.calories,
        protein: foodLog.protein,
        carbs: foodLog.carbs,
        fat: foodLog.fat,
      });
      Toast.success("Favorite added");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <DateNavigationHeader />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: dynamicBottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <NutrientSummary
            percentages={dailyPercentages}
            targets={dailyTargets || defaultTargets}
            totals={dailyTotals}
          />

          {todayFoodLogs.map((foodLog) => (
            <SwipeToFunctions
              key={foodLog.id}
              onDelete={() => {
                deleteFoodLog(foodLog.id);
              }}
              onFavorite={() => toggleFavorite(foodLog)}
            >
              <LogCard
                key={foodLog.id}
                foodLog={foodLog}
                isLoading={foodLog.isEstimating}
              />
            </SwipeToFunctions>
          ))}
        </ScrollView>
      </SafeAreaView>
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
    scrollView: {
      paddingVertical: themeObj.spacing.md,
      paddingHorizontal: themeObj.spacing.md,
      gap: themeObj.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: themeObj.spacing.md,
    },
  });
};

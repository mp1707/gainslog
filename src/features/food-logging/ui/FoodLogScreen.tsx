import React, { useRef, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FoodLog } from "@/types";
import { createStyles } from "./FoodLogScreen.styles";
import {
  useFoodLogStore,
  selectDailyTargets,
  selectFoodLogs,
} from "@/stores/useFoodLogStore";
import { useTheme } from "@/providers/ThemeProvider";
import { useDateNavigation } from "./hooks/useDateNavigation";
import { useTabBarSpacing } from "./hooks/useTabBarSpacing";
import { useFavoriteSelection } from "./hooks/useFavoriteSelection";
import { DateNavigationHeader } from "./components/DateNavigationHeader";
import { FoodLogsList } from "./components/FoodLogsList";
import { FavoritesPickerModal } from "./molecules/FavoritesPickerModal";
import { NutritionHub } from "./components/NutritionHub";
import { CaloriesSection } from "./components/CaloriesSection";
import { MacronutriensSection } from "./components/MacronutriensSection";
import { NutrientHub } from "../NutrientHub";

interface FoodLogScreenProps {
  isLoadingLogs: boolean;
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
  scrollToTop?: boolean;
  isFavoritesModalVisible?: boolean;
  onCloseFavoritesModal?: () => void;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  isLoadingLogs,
  onDeleteLog,
  onAddInfo,
  scrollToTop,
  isFavoritesModalVisible = false,
  onCloseFavoritesModal,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const foodLogs = useFoodLogStore(selectFoodLogs);
  const dailyTargets = useFoodLogStore(selectDailyTargets);

  const { colors } = useTheme();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const {
    selectedDate,
    handleDateChange,
    navigateToPreviousDay,
    navigateToNextDay,
    isToday,
  } = useDateNavigation();

  const filteredFoodLogs = useMemo(() => {
    return foodLogs.filter((log) => log.date === selectedDate);
  }, [foodLogs, selectedDate]);

  // Compute totals once
  const currentTotals = useMemo(() => {
    return filteredFoodLogs.reduce(
      (totals, log) => ({
        calories: totals.calories + log.calories,
        protein: totals.protein + log.protein,
        carbs: totals.carbs + log.carbs,
        fat: totals.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filteredFoodLogs]);

  const percentages = useMemo(() => {
    return {
      calories:
        dailyTargets.calories > 0
          ? Math.round((currentTotals.calories / dailyTargets.calories) * 100)
          : 0,
      protein:
        dailyTargets.protein > 0
          ? Math.round((currentTotals.protein / dailyTargets.protein) * 100)
          : 0,
      carbs:
        dailyTargets.carbs > 0
          ? Math.round((currentTotals.carbs / dailyTargets.carbs) * 100)
          : 0,
      fat:
        dailyTargets.fat > 0
          ? Math.round((currentTotals.fat / dailyTargets.fat) * 100)
          : 0,
    };
  }, [currentTotals, dailyTargets]);

  const styles = useMemo(
    () => createStyles(colors, dynamicBottomPadding),
    [colors, dynamicBottomPadding]
  );

  const isTodayMemo = useMemo(() => isToday(), [isToday]);

  const { selectFavorite } = useFavoriteSelection({
    selectedDate,
    onSelectionComplete: onCloseFavoritesModal || (() => {}),
  });

  React.useEffect(() => {
    if (scrollToTop) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollToTop]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <DateNavigationHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onNavigatePrevious={navigateToPreviousDay}
        onNavigateNext={navigateToNextDay}
        isToday={isTodayMemo}
      />
      <View style={styles.statsContainer}>
        {/* <NutritionHub
          current={currentTotals}
          targets={dailyTargets}
          percentages={percentages}
        /> */}
        <NutrientHub
          key={selectedDate}
          percentages={percentages}
          targets={dailyTargets}
          totals={currentTotals}
        />
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.statsContainer}>
          <CaloriesSection
            current={currentTotals}
            targets={dailyTargets}
            percentages={percentages}
          />
          <MacronutriensSection
            current={currentTotals}
            targets={dailyTargets}
            percentages={percentages}
          />
        </View> */}
        <FoodLogsList
          isLoadingLogs={isLoadingLogs}
          foodLogs={filteredFoodLogs}
          onDeleteLog={onDeleteLog}
          onAddInfo={onAddInfo}
        />
      </ScrollView>

      <FavoritesPickerModal
        visible={isFavoritesModalVisible}
        onClose={onCloseFavoritesModal || (() => {})}
        onSelectFavorite={selectFavorite}
      />
    </SafeAreaView>
  );
};

import React, { useRef, useMemo, useCallback } from "react";
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
import { MacronutriensSection } from "./components/MacronutriensSection";
import { CaloriesSection } from "./components/CaloriesSection";
import { FoodLogsList } from "./components/FoodLogsList";
import { FavoritesPickerModal } from "./molecules/FavoritesPickerModal";

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

  // Optimized store selectors - individual selectors to prevent object recreation
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

  // Memoize expensive computations
  const filteredFoodLogs = useMemo(() => {
    return foodLogs.filter((log) => log.date === selectedDate);
  }, [foodLogs, selectedDate]);

  const dailyProgress = useMemo(() => {
    const current = filteredFoodLogs.reduce(
      (totals, log) => ({
        calories: totals.calories + log.calories,
        protein: totals.protein + log.protein,
        carbs: totals.carbs + log.carbs,
        fat: totals.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const percentages = {
      calories:
        dailyTargets.calories > 0
          ? Math.round((current.calories / dailyTargets.calories) * 100)
          : 0,
      protein:
        dailyTargets.protein > 0
          ? Math.round((current.protein / dailyTargets.protein) * 100)
          : 0,
      carbs:
        dailyTargets.carbs > 0
          ? Math.round((current.carbs / dailyTargets.carbs) * 100)
          : 0,
      fat:
        dailyTargets.fat > 0
          ? Math.round((current.fat / dailyTargets.fat) * 100)
          : 0,
    };

    return {
      current,
      targets: dailyTargets,
      percentages,
    };
  }, [filteredFoodLogs, dailyTargets]);

  const styles = useMemo(
    () => createStyles(colors, dynamicBottomPadding),
    [colors, dynamicBottomPadding]
  );

  const isTodayMemo = useMemo(() => isToday(), [isToday]);

  // Use custom hook for favorite selection logic
  const { selectFavorite } = useFavoriteSelection({
    selectedDate,
    onSelectionComplete: onCloseFavoritesModal || (() => {}),
  });

  // Handle scroll to top when prop changes
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

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <CaloriesSection dailyProgress={dailyProgress} />

          <MacronutriensSection dailyProgress={dailyProgress} />
        </View>

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

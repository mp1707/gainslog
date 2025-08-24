import React, { useRef, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { FoodLog } from "@/types";
import { createStyles } from "./FoodLogScreen.styles";
import { useAppStore } from "@/store";
import { useTheme } from "@/theme";
import { useDateNavigation } from "@/hooks-new/useDateNavigation";
import { useTabBarSpacing } from "../../../hooks/useTabBarSpacing";
import { useFavoriteSelection } from "../../../hooks/useFavoriteSelection";
import { DateNavigationHeader } from "../DateNavigationHeader";
import { FoodLogsList } from "../FoodLogsList";
import { theme } from "@/theme/theme";
import { AppText } from "@/components/shared/AppText";
import { NutrientSummary } from "@/components/daily-food-logs/NutrientSummary";

const DEFAULT_DAILY_TARGETS = Object.freeze({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

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
  const scrollY = useSharedValue(0);

  const foodLogs = useAppStore((s) => s.foodLogs);
  const dailyTargetsState = useAppStore((s) => s.dailyTargets);
  const dailyTargets = dailyTargetsState ?? DEFAULT_DAILY_TARGETS;

  const { colors } = useTheme();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { selectedDate, isToday, goToPrev, goToNext, setDate } =
    useDateNavigation();

  const handleDateChange = (_event: any, date?: Date) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setDate(`${year}-${month}-${day}`);
  };

  const filteredFoodLogs = useMemo(() => {
    return foodLogs.filter((log) => log.date === selectedDate);
  }, [foodLogs, selectedDate]);

  // Compute totals once
  const currentTotals = useMemo(() => {
    return filteredFoodLogs.reduce(
      (totals, log) => {
        const calories = log.userCalories ?? log.generatedCalories ?? 0;
        const protein = log.userProtein ?? log.generatedProtein ?? 0;
        const carbs = log.userCarbs ?? log.generatedCarbs ?? 0;
        const fat = log.userFat ?? log.generatedFat ?? 0;

        return {
          calories: totals.calories + calories,
          protein: totals.protein + protein,
          carbs: totals.carbs + carbs,
          fat: totals.fat + fat,
        };
      },
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

  const isTodayMemo = isToday;

  const { selectFavorite } = useFavoriteSelection({
    selectedDate,
    onSelectionComplete: onCloseFavoritesModal || (() => {}),
  });

  React.useEffect(() => {
    if (scrollToTop) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollToTop]);

  // Handle nutrient hub enlarging - scroll food logs to top
  const handleNutrientHubEnlarge = React.useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleScroll = (event: any) => {
    const newScrollY = event.nativeEvent.contentOffset.y;
    scrollY.value = newScrollY;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <DateNavigationHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onNavigatePrevious={goToPrev}
        onNavigateNext={goToNext}
        isToday={isTodayMemo}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
      >
        <View style={{ gap: theme.spacing.md }}>
          <AppText role="Title2">Today's Progress</AppText>
          <NutrientSummary
            percentages={percentages}
            targets={dailyTargets}
            totals={currentTotals}
          />
          {/* <LargeNutrientHub
            percentages={percentages}
            targets={dailyTargets}
            totals={currentTotals}
          /> */}
        </View>
        <FoodLogsList
          isLoadingLogs={isLoadingLogs}
          foodLogs={filteredFoodLogs}
          onDeleteLog={onDeleteLog}
          onAddInfo={onAddInfo}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

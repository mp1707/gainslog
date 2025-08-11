import React, { useRef } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpandableFAB } from "@/shared/ui";
import { FoodLog } from "@/types";
import { createStyles } from "./FoodLogScreen.styles";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { useTheme } from "@/providers/ThemeProvider";
import { useDateNavigation } from "./hooks/useDateNavigation";
import { useTabBarSpacing } from "./hooks/useTabBarSpacing";
import { DateNavigationHeader } from "./components/DateNavigationHeader";
import { MacronutriensSection } from "./components/MacronutriensSection";
import { CaloriesSection } from "./components/CaloriesSection";
import { FoodLogsList } from "./components/FoodLogsList";
import { FavoritesPickerModal } from "@/shared/ui/molecules/FavoritesPickerModal/FavoritesPickerModal";
import { FavoriteEntry } from "@/types";
import { generateFoodLogId } from "@/lib/storage";

interface FoodLogScreenProps {
  isLoadingLogs: boolean;
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
  scrollToTop?: boolean;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  isLoadingLogs,
  onDeleteLog,
  onAddInfo,
  scrollToTop,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    getDailyProgress,
    triggerManualLog,
    triggerCameraCapture,
    triggerLibraryCapture,
    triggerAudioCapture,
    getFilteredFoodLogs,
  } = useFoodLogStore();

  const { colors } = useTheme();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const {
    selectedDate,
    handleDateChange,
    navigateToPreviousDay,
    navigateToNextDay,
    isToday,
  } = useDateNavigation();

  const dailyProgress = getDailyProgress();
  const styles = createStyles(colors, dynamicBottomPadding);
  const filteredFoodLogs = getFilteredFoodLogs();
  const [isFavoritesModalVisible, setFavoritesModalVisible] =
    React.useState(false);

  const handleManualLog = () => {
    triggerManualLog();
  };

  const handleCameraLog = () => {
    triggerCameraCapture();
  };

  const handleLibraryLog = () => {
    triggerLibraryCapture();
  };

  const handleAudioLog = () => {
    triggerAudioCapture();
  };

  const handleFavoritesLog = () => {
    setFavoritesModalVisible(true);
  };

  const handleSelectFavorite = (fav: FavoriteEntry) => {
    const now = new Date();
    const id = generateFoodLogId();
    const log: FoodLog = {
      id,
      userTitle: fav.title,
      userDescription: fav.description,
      generatedTitle: fav.title,
      estimationConfidence: 100,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      createdAt: now.toISOString(),
      date: selectedDate,
      needsAiEstimation: false,
    };
    // Add directly without AI estimation
    // Reuse store path for persistence and state update
    useFoodLogStore.getState().addFoodLog(log);
    setFavoritesModalVisible(false);
  };

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
        isToday={isToday()}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <CaloriesSection dailyProgress={dailyProgress} />

        <MacronutriensSection dailyProgress={dailyProgress} />

        <FoodLogsList
          isLoadingLogs={isLoadingLogs}
          foodLogs={filteredFoodLogs}
          onDeleteLog={onDeleteLog}
          onAddInfo={onAddInfo}
        />
      </ScrollView>

      <ExpandableFAB
        onManualLog={handleManualLog}
        onCameraLog={handleCameraLog}
        onLibraryLog={handleLibraryLog}
        onAudioLog={handleAudioLog}
        onFavoritesLog={handleFavoritesLog}
      />

      <FavoritesPickerModal
        visible={isFavoritesModalVisible}
        onClose={() => setFavoritesModalVisible(false)}
        onSelectFavorite={handleSelectFavorite}
      />
    </SafeAreaView>
  );
};

import React, { useRef } from "react";
import { ScrollView, View } from "react-native";
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
import { useState, useEffect } from "react";

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

  // Track layout for the main stats (Calories + Macros)
  const statsLayoutRef = useRef<{ y: number; height: number }>({
    y: 0,
    height: 0,
  });
  const [miniProgress, setMiniProgress] = useState(0);

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
  useEffect(() => {
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
        miniProgress={miniProgress}
        progress={dailyProgress}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const bottomOfStats =
            statsLayoutRef.current.y + statsLayoutRef.current.height;
          if (bottomOfStats <= 0) {
            setMiniProgress(0);
            return;
          }
          // Start fading just before stats leave the viewport
          const fadeStart = bottomOfStats - 24; // begin slightly early
          const fadeDistance = 80; // px over which to interpolate to 1
          const raw = (y - fadeStart) / fadeDistance;
          const clamped = Math.max(0, Math.min(1, raw));
          setMiniProgress(clamped);
        }}
        scrollEventThrottle={16}
      >
        <View
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            statsLayoutRef.current = { y, height };
          }}
          style={styles.statsContainer}
        >
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

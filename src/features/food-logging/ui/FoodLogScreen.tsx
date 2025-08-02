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
      />
    </SafeAreaView>
  );
};

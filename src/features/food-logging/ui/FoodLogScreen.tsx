import React from "react";
import {
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { 
  Layout,
  FadeInUp,
} from "react-native-reanimated";
import { SwipeToDelete, SkeletonCard, ExpandableFAB } from "@/shared/ui";
import { FoodLogCard } from "./FoodLogCard";
import { FoodLogHeader } from "./FoodLogHeader";
import { FoodLog } from "../../../types";
import { createStyles } from "./FoodLogScreen.styles";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";
import { useTheme } from "../../../providers/ThemeProvider";

interface FoodLogScreenProps {
  isLoadingLogs: boolean;
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  isLoadingLogs,
  onDeleteLog,
  onAddInfo,
}) => {
  const {
    triggerManualLog,
    triggerCameraCapture,
    triggerLibraryCapture,
    triggerAudioCapture,
    getFilteredFoodLogs,
  } = useFoodLogStore();
  
  const { theme, colors } = useTheme();
  const styles = createStyles(colors);
  const filteredFoodLogs = getFilteredFoodLogs();

  const handleDeleteLog = async (logId: string) => {
    await onDeleteLog(logId);
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <FoodLogHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoadingLogs ? (
          <Animated.View>
            {[1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.delay(i * 80).springify().damping(18).stiffness(150)}
                layout={Layout.springify().damping(18).stiffness(150).mass(1)}
              >
                <SkeletonCard />
              </Animated.View>
            ))}
          </Animated.View>
        ) : (
          filteredFoodLogs.map((log, index) => (
            <Animated.View
              key={log.id}
              entering={FadeInUp.delay(index * 80).springify().damping(18).stiffness(150)}
              layout={Layout.springify().damping(18).stiffness(150).mass(1)}
            >
              <SwipeToDelete
                onDelete={() => handleDeleteLog(log.id)}
              >
                <FoodLogCard foodLog={log} onAddInfo={onAddInfo} />
              </SwipeToDelete>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Expandable Floating Action Button */}
      <ExpandableFAB
        onManualLog={handleManualLog}
        onCameraLog={handleCameraLog}
        onLibraryLog={handleLibraryLog}
        onAudioLog={handleAudioLog}
      />
    </SafeAreaView>
  );
};

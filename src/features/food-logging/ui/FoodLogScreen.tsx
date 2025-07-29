import React from "react";
import { View, ScrollView, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { Layout, FadeInUp } from "react-native-reanimated";
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
  const insets = useSafeAreaInsets();

  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };

  // Calculate dynamic bottom padding
  // Tab bar height + FAB spacing + extra clearance for comfortable scrolling
  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding =
    tabBarHeight + theme.spacing.lg + theme.spacing.md;

  const styles = createStyles(colors, dynamicBottomPadding);
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
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
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
                entering={FadeInUp.delay(i * 80)
                  .springify()
                  .damping(18)
                  .stiffness(150)}
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
              entering={FadeInUp.delay(index * 80)
                .springify()
                .damping(18)
                .stiffness(150)}
              layout={Layout.springify().damping(18).stiffness(150).mass(1)}
            >
              <SwipeToDelete onDelete={() => handleDeleteLog(log.id)}>
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

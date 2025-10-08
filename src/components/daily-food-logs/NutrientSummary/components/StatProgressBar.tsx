import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { theme } from "@/theme";

interface StatProgressBarProps {
  /** Animated progress value (0-100) */
  progressValue: SharedValue<number>;
  /** Color for the progress fill */
  fillColor: string;
  /** Color for the track background */
  trackColor: string;
}

/**
 * Animated progress bar for nutrient stats
 *
 * @example
 * ```tsx
 * const progress = useSharedValue(0);
 *
 * <StatProgressBar
 *   progressValue={progress}
 *   fillColor={colors.semantic.fat}
 *   trackColor={colors.semanticSurfaces.fat}
 * />
 * ```
 */
export const StatProgressBar: React.FC<StatProgressBarProps> = ({
  progressValue,
  fillColor,
  trackColor,
}) => {
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
    backgroundColor: fillColor,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.fill, progressStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});

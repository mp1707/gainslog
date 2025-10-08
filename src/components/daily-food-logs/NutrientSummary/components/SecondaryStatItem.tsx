import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { CircleCheckBig, TriangleAlert } from "lucide-react-native";
import { AppText } from "@/components";
import { theme } from "@/theme";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { StatProgressBar } from "./StatProgressBar";
import type { FatIconState } from "../utils/fatCalculations";

interface SecondaryStatItemProps {
  /** The nutrient key */
  nutrientKey: "fat" | "carbs";
  /** The default icon */
  Icon: LucideIcon;
  /** Label text */
  label: string;
  /** Current animated value */
  currentValue: number | string;
  /** Target value */
  targetValue: number;
  /** Whether this stat has a target */
  hasTarget: boolean;
  /** Icon color */
  iconColor: string;
  /** Fill color for complete state */
  iconFill: string;
  /** Animated scale for icon */
  iconScale: SharedValue<number>;
  /** Animated progress value */
  progressValue: SharedValue<number>;
  /** Progress fill color */
  progressFillColor: string;
  /** Progress track color */
  progressTrackColor: string;
  /** Optional fat range label */
  fatRangeLabel?: string | null;
  /** Fat icon state (for fat nutrient only) */
  fatIconState?: FatIconState;
  /** Warning color */
  warningColor?: string;
  /** Warning background color */
  warningBackgroundColor?: string;
  /** Press handler */
  onPress: () => void;
}

/**
 * Secondary stat item for fat and carbs nutrients
 * Displays icon, label, value, and progress bar
 */
export const SecondaryStatItem: React.FC<SecondaryStatItemProps> = ({
  nutrientKey,
  Icon,
  label,
  currentValue,
  targetValue,
  hasTarget,
  iconColor,
  iconFill,
  iconScale,
  progressValue,
  progressFillColor,
  progressTrackColor,
  fatRangeLabel,
  fatIconState,
  warningColor,
  warningBackgroundColor,
  onPress,
}) => {
  const { handlePressIn, handlePressOut, pressAnimatedStyle } = usePressAnimation();

  // Determine icon based on state (fat only)
  let StatIcon = Icon;
  let finalIconColor = iconColor;
  let finalIconFill = iconFill;
  let finalStrokeWidth = 0;

  if (nutrientKey === "fat" && fatIconState) {
    if (fatIconState === "warning") {
      StatIcon = TriangleAlert;
      finalIconColor = warningColor || iconColor;
      finalIconFill = warningBackgroundColor || iconFill;
      finalStrokeWidth = 2;
    } else if (fatIconState === "complete") {
      StatIcon = CircleCheckBig;
      finalStrokeWidth = 2;
    }
  }

  const statIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: (fatIconState === "complete" || fatIconState === "warning")
        ? iconScale.value
        : 1
    }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.container, pressAnimatedStyle]}>
        <Animated.View style={statIconAnimatedStyle}>
          <StatIcon
            size={20}
            color={finalIconColor}
            fill={finalIconFill}
            strokeWidth={finalStrokeWidth}
          />
        </Animated.View>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.labelContainer}>
              <AppText role="Caption" color="secondary">
                {label}
              </AppText>
              {fatRangeLabel && (
                <AppText role="Caption" color="secondary">
                  Baseline {fatRangeLabel}
                </AppText>
              )}
            </View>
            <View style={styles.value}>
              {hasTarget ? (
                <>
                  <AppText role="Body" color="primary">
                    {currentValue}
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {" / "}
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {targetValue}
                  </AppText>
                </>
              ) : (
                <AppText role="Body" color="secondary">
                  {currentValue}
                </AppText>
              )}
            </View>
          </View>
          {hasTarget && targetValue > 0 && (
            <StatProgressBar
              progressValue={progressValue}
              fillColor={progressFillColor}
              trackColor={progressTrackColor}
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: theme.spacing.xs,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    gap: theme.spacing.xs / 4,
  },
  value: {
    flexDirection: "row",
    alignItems: "center",
  },
});

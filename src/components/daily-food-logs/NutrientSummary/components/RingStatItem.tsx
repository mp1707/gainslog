import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { theme } from "@/theme";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { RingLabel } from "./RingLabel";

interface RingStatItemProps {
  /** The nutrient key */
  nutrientKey: "calories" | "protein";
  /** Label text */
  label: string;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Animated current value */
  currentValue: number | string;
  /** Target value */
  targetValue: number;
  /** Delta value (remaining or over) */
  deltaValue: number | string;
  /** Delta label ("remaining" or "over") */
  deltaLabel: string;
  /** Ring color */
  ringColor: string;
  /** Track color */
  trackColor: string;
  /** Text color */
  textColor: string;
  /** Chevron icon */
  ChevronIcon: LucideIcon;
  /** Label icon */
  LabelIcon: LucideIcon;
  /** Icon color */
  iconColor: string;
  /** Icon fill */
  iconFill: string;
  /** Icon stroke width */
  iconStrokeWidth: number;
  /** Animated scale for label icon */
  iconScale: SharedValue<number>;
  /** Animation delay in ms */
  animationDelay: number;
  /** Whether to skip animation */
  skipAnimation: boolean;
  /** Press handler */
  onPress: () => void;
}

/**
 * Ring stat item for calories and protein nutrients
 * Displays circular progress ring with label
 */
export const RingStatItem: React.FC<RingStatItemProps> = ({
  label,
  percentage,
  currentValue,
  targetValue,
  deltaValue,
  deltaLabel,
  ringColor,
  trackColor,
  textColor,
  ChevronIcon,
  LabelIcon,
  iconColor,
  iconFill,
  iconStrokeWidth,
  iconScale,
  animationDelay,
  skipAnimation,
  onPress,
}) => {
  const { handlePressIn, handlePressOut, pressAnimatedStyle } = usePressAnimation();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
    >
      <Animated.View style={pressAnimatedStyle}>
        <DashboardRing
          percentage={percentage}
          color={ringColor}
          trackColor={trackColor}
          textColor={textColor}
          label={label}
          displayValue={deltaValue.toString()}
          displayUnit=""
          detailValue={deltaLabel}
          detailUnit=""
          showDetail={false}
          animationDelay={animationDelay}
          strokeWidth={20}
          Icon={ChevronIcon}
          skipAnimation={skipAnimation}
        />
        <RingLabel
          Icon={LabelIcon}
          iconScale={iconScale}
          iconColor={iconColor}
          iconFill={iconFill}
          iconStrokeWidth={iconStrokeWidth}
          label={label}
          currentValue={currentValue}
          targetValue={targetValue}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});

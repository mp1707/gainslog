import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { theme } from "@/theme";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { DashboardRing } from "@/components/shared/ProgressRings";

interface RingStatItemProps {
  /** Label text */
  label: string;
  /** Percentage complete (0-100) */
  percentage: number;
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
  deltaValue,
  deltaLabel,
  ringColor,
  trackColor,
  textColor,
  ChevronIcon,
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
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
});

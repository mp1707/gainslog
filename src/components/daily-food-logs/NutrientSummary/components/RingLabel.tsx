import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "@/components";
import { theme } from "@/theme";

interface RingLabelProps {
  /** The icon to display */
  Icon: LucideIcon;
  /** Animated scale value for icon bounce effect */
  iconScale: SharedValue<number>;
  /** Icon color */
  iconColor: string;
  /** Icon fill color */
  iconFill: string;
  /** Icon stroke width */
  iconStrokeWidth: number;
  /** Label text (e.g., "Calories (kcal)") */
  label: string;
  /** Current value */
  currentValue: number | string;
  /** Target value */
  targetValue: number;
}

/**
 * Label component for ring stats showing icon, label, and progress
 *
 * @example
 * ```tsx
 * <RingLabel
 *   Icon={BicepsFlexed}
 *   iconScale={proteinIconScale}
 *   iconColor={colors.semantic.protein}
 *   iconFill={colors.semantic.protein}
 *   iconStrokeWidth={0}
 *   label="Protein (g)"
 *   currentValue={120}
 *   targetValue={160}
 * />
 * ```
 */
export const RingLabel: React.FC<RingLabelProps> = ({
  Icon,
  iconScale,
  iconColor,
  iconFill,
  iconStrokeWidth,
  label,
  currentValue,
  targetValue,
}) => {
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={iconAnimatedStyle}>
          <Icon
            size={20}
            color={iconColor}
            fill={iconFill}
            strokeWidth={iconStrokeWidth}
          />
        </Animated.View>
        <AppText role="Caption" color="secondary">
          {label}
        </AppText>
      </View>
      <View style={styles.progress}>
        <AppText role="Body" color="primary">
          {currentValue}
        </AppText>
        <AppText role="Caption" color="secondary">
          {" / "}
        </AppText>
        <AppText role="Caption" color="secondary">
          {targetValue}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: theme.spacing.xs / 2,
    marginTop: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
  },
});

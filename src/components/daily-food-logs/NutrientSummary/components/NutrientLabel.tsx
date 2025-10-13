import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "@/components";
import { theme } from "@/theme";

interface NutrientLabelProps {
  /** Icon representing the nutrient */
  Icon: LucideIcon;
  /** Optional animated scale value for celebratory icon bounce */
  iconScale?: SharedValue<number>;
  /** Icon stroke color */
  iconColor: string;
  /** Icon fill color */
  iconFill?: string;
  /** Optional icon stroke width */
  iconStrokeWidth?: number;
  /** Label text, e.g. "Calories" */
  label: string;
  /** Display value for the nutrient */
  currentValue: number | string;
  /** Optional target value to pair with current value */
  targetValue?: number | string | null;
  /** Optional unit appended to numbers */
  unit?: string;
  /** Optional style override for layout adjustments */
  style?: StyleProp<ViewStyle>;
}

/**
 * Shared macro label used beneath nutrient rings.
 * Aligns icons and text consistently for all macro nutrients.
 */
export const NutrientLabel: React.FC<NutrientLabelProps> = ({
  Icon,
  iconScale,
  iconColor,
  iconFill,
  iconStrokeWidth,
  label,
  currentValue,
  targetValue,
  unit,
  style,
}) => {
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale ? iconScale.value : 1 }],
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
        <Icon
          size={22}
          color={iconColor}
          fill={iconFill}
          strokeWidth={iconStrokeWidth ?? 0}
        />
      </Animated.View>
      <View style={styles.textContainer}>
        <AppText role="Subhead" color="secondary">
          {label}
        </AppText>
        <View style={styles.valuesRow}>
          <AppText role="Headline" color="primary">
            {currentValue}
          </AppText>
          {unit && targetValue == null && (
            <AppText role="Body" color="secondary" style={styles.unitSpacing}>
              {unit}
            </AppText>
          )}
          {targetValue != null ? (
            <>
              <AppText role="Body" color="secondary" style={styles.separator}>
                /
              </AppText>
              <AppText role="Body" color="secondary">
                {targetValue}
                {unit}
              </AppText>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  valuesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.xs,
  },
  separator: {
    marginBottom: 4,
  },
  unitSpacing: {
    marginBottom: 2,
  },
});

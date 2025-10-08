import React from "react";
import { View, ViewStyle } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { createStyles } from "./NutrientStat.styles";
import {
  formatNutrientValue,
  createNutrientAccessibilityLabel,
} from "./utils/formatters";

/**
 * Props for the NutrientStat component
 */
export interface NutrientStatProps {
  /** The label for the nutrient (e.g., "Protein", "Calories") */
  label: string;
  /** The current consumed value */
  currentValue: number;
  /** The target goal value */
  goalValue: number;
  /** Optional unit of measurement (e.g., "g", "kcal") */
  unit?: string;
  /** The color for the indicator dot */
  color: string;
  /** Optional custom styles for the container */
  style?: ViewStyle;
}

/**
 * NutrientStat displays a nutrient's current value versus its goal.
 *
 * Features:
 * - Colored indicator dot for visual identification
 * - Current/goal value display
 * - Accessible label for screen readers
 *
 * @example
 * ```tsx
 * <NutrientStat
 *   label="Protein"
 *   currentValue={120}
 *   goalValue={160}
 *   unit="g"
 *   color={colors.semantic.protein}
 * />
 * ```
 */
export const NutrientStat: React.FC<NutrientStatProps> = ({
  label,
  currentValue,
  goalValue,
  unit,
  color,
  style,
}) => {
  const styles = createStyles();

  const formattedCurrentValue = formatNutrientValue(currentValue);
  const formattedGoalValue = formatNutrientValue(goalValue);
  const accessibilityLabel = createNutrientAccessibilityLabel(
    label,
    currentValue,
    goalValue,
    unit
  );

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <View style={styles.labelContainer}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText role="Subhead" style={styles.labelText}>
          {label}
        </AppText>
      </View>

      <View style={styles.valueContainer}>
        <AppText role="Body" color="primary" style={styles.currentValue}>
          {formattedCurrentValue}
        </AppText>
        <AppText role="Body" color="secondary" style={styles.goalValue}>
          {" / "}
          {formattedGoalValue} {unit}
        </AppText>
      </View>
    </View>
  );
};

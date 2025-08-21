import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { AppText } from "@/components/AppText";
import { createStyles } from "./NutrientStat.styles";

export interface NutrientStatProps {
  label: string;
  currentValue: number;
  goalValue: number;
  unit?: string;
  color: string;
  style?: ViewStyle;
}

export const NutrientStat: React.FC<NutrientStatProps> = ({
  label,
  currentValue,
  goalValue,
  unit,
  color,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const accessibilityLabel = `${label}: ${currentValue} of ${goalValue} ${unit}`;

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.labelContainer}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText role="Subhead" style={styles.labelText}>
          {label}
        </AppText>
      </View>

      {/* --- START: The key change is here --- */}
      {/* We now use a View as a dedicated container for the values. */}
      <View style={styles.valueContainer}>
        <AppText role="Body" color="primary" style={styles.currentValue}>
          {Math.round(currentValue)}
        </AppText>
        <AppText role="Body" color="secondary" style={styles.goalValue}>
          {" / "}
          {Math.round(goalValue)} {unit}
        </AppText>
      </View>
      {/* --- END: The key change is here --- */}
    </View>
  );
};

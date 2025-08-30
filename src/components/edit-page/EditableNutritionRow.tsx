import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { theme } from "@/theme";

interface EditableNutritionRowProps {
  label: string;
  value: number;
  unit: string;
  onPress: () => void;
}

export const EditableNutritionRow: React.FC<EditableNutritionRowProps> = ({
  label,
  value,
  unit,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={[styles.label, { color: colors.primaryText }]}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: colors.primaryText }]}>
          {value}
        </Text>
        <Text style={[styles.unitText, { color: colors.secondaryText }]}>
          {unit}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    minHeight: 50,
  },
  label: {
    ...theme.typography.Body,
    flex: 1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  valueText: {
    ...theme.typography.Body,
  },
  unitText: {
    ...theme.typography.Caption,
    marginLeft: theme.spacing.xs,
  },
});
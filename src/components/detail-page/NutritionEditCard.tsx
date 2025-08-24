import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/providers";
import { theme } from "@/theme";
import { LegacyFoodLog } from "src/types-legacy/indexLegacy";

interface NutritionEditRowProps {
  label: string;
  value: number;
  unit: string;
  semanticColor: string;
  onChangeText: (text: string) => void;
}

const NutritionEditRow: React.FC<NutritionEditRowProps> = ({
  label,
  value,
  unit,
  semanticColor,
  onChangeText,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.nutritionRow}>
      <View style={styles.labelContainer}>
        <View
          style={[styles.semanticDot, { backgroundColor: semanticColor }]}
        />
        <Text style={[styles.nutritionLabel, { color: colors.primaryText }]}>
          {label}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.nutritionInput,
            {
              color: colors.primaryText,
              backgroundColor: colors.primaryBackground,
              borderColor: colors.border,
            },
          ]}
          value={String(value || "")}
          onChangeText={onChangeText}
          keyboardType="numeric"
          returnKeyType="done"
          textAlign="right"
          placeholder="0"
          placeholderTextColor={colors.secondaryText}
        />
        <Text style={[styles.unitText, { color: colors.secondaryText }]}>
          {unit}
        </Text>
      </View>
    </View>
  );
};

interface NutritionEditCardProps {
  log: LegacyFoodLog;
  onUpdateNutrition: (field: string, value: number) => void;
}

export const NutritionEditCard: React.FC<NutritionEditCardProps> = ({
  log,
  onUpdateNutrition,
}) => {
  const { colors } = useTheme();
  const componentStyles = theme.getComponentStyles();

  const handleNumericChange = (field: string, text: string) => {
    const numericValue = parseFloat(text) || 0;
    onUpdateNutrition(field, numericValue);
  };

  return (
    <View style={[styles.card, { ...componentStyles.cards }]}>
      <NutritionEditRow
        label="Calories"
        value={log.userCalories || log.calories}
        unit="kcal"
        semanticColor={colors.semantic.calories}
        onChangeText={(text) => handleNumericChange("userCalories", text)}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Protein"
        value={log.userProtein || log.protein}
        unit="g"
        semanticColor={colors.semantic.protein}
        onChangeText={(text) => handleNumericChange("userProtein", text)}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Carbs"
        value={log.userCarbs || log.carbs}
        unit="g"
        semanticColor={colors.semantic.carbs}
        onChangeText={(text) => handleNumericChange("userCarbs", text)}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Fat"
        value={log.userFat || log.fat}
        unit="g"
        semanticColor={colors.semantic.fat}
        onChangeText={(text) => handleNumericChange("userFat", text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.pageMargins.horizontal,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  semanticDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.md,
  },
  nutritionLabel: {
    ...theme.typography.Body,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
  },
  nutritionInput: {
    ...theme.typography.Body,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minWidth: 60,
    textAlign: "right",
  },
  unitText: {
    ...theme.typography.Caption,
    marginLeft: theme.spacing.xs,
    minWidth: 30,
  },
  divider: {
    height: 1,
    marginHorizontal: -theme.spacing.md,
  },
});

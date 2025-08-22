import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/providers";
import { theme } from "@/theme";
import { LegacyFoodLog } from "@/types/indexLegacy";

interface NutritionRowProps {
  label: string;
  value: number;
  unit: string;
  semanticColor: string;
}

const NutritionRow: React.FC<NutritionRowProps> = ({
  label,
  value,
  unit,
  semanticColor,
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
      <Text style={[styles.nutritionValue, { color: colors.secondaryText }]}>
        {value} {unit}
      </Text>
    </View>
  );
};

interface NutritionViewCardProps {
  log: LegacyFoodLog;
}

export const NutritionViewCard: React.FC<NutritionViewCardProps> = ({
  log,
}) => {
  const { colors } = useTheme();
  const componentStyles = theme.getComponentStyles();

  return (
    <View style={[styles.card, { ...componentStyles.cards }]}>
      <NutritionRow
        label="Calories"
        value={log.userCalories || log.calories}
        unit="kcal"
        semanticColor={colors.semantic.calories}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionRow
        label="Protein"
        value={log.userProtein || log.protein}
        unit="g"
        semanticColor={colors.semantic.protein}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionRow
        label="Carbs"
        value={log.userCarbs || log.carbs}
        unit="g"
        semanticColor={colors.semantic.carbs}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionRow
        label="Fat"
        value={log.userFat || log.fat}
        unit="g"
        semanticColor={colors.semantic.fat}
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
  nutritionValue: {
    ...theme.typography.Body,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginHorizontal: -theme.spacing.md,
  },
});

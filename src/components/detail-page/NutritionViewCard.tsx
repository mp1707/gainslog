import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, useThemedStyles } from "@/theme";
import { FoodLog } from "@/types/models";

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
  const styles = useThemedStyles(createStyles);


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
  log: FoodLog;
}

export const NutritionViewCard: React.FC<NutritionViewCardProps> = ({
  log,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <NutritionRow
        label="Calories"
        value={log.calories ?? 0}
        unit="kcal"
        semanticColor={colors.semantic.calories}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionRow
        label="Protein"
        value={log.protein ?? 0}
        unit="g"
        semanticColor={colors.semantic.protein}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionRow
        label="Carbs"
        value={log.carbs ?? 0}
        unit="g"
        semanticColor={colors.semantic.carbs}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionRow
        label="Fat"
        value={log.fat ?? 0}
        unit="g"
        semanticColor={colors.semantic.fat}
      />
    </View>
  );
};

const createStyles = (colors: any, themeObj: any) => StyleSheet.create({
  card: {
    padding: themeObj.spacing.md,
    marginHorizontal: themeObj.spacing.pageMargins.horizontal,
    backgroundColor: colors.secondaryBackground,
    borderRadius: themeObj.components.cards.cornerRadius,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: themeObj.spacing.md,
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
    marginRight: themeObj.spacing.md,
  },
  nutritionLabel: {
    ...themeObj.typography.Body,
  },
  nutritionValue: {
    ...themeObj.typography.Body,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginHorizontal: -themeObj.spacing.md,
  },
});

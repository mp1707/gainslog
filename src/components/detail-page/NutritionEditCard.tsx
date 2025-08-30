import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme, useThemedStyles } from "@/theme";
import { FoodLog } from "@/types/models";

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
  const styles = useThemedStyles(createRowStyles);

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
  log: FoodLog;
  onUpdateNutrition: (field: string, value: number) => void;
}

export const NutritionEditCard: React.FC<NutritionEditCardProps> = ({
  log,
  onUpdateNutrition,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createCardStyles);

  const handleNumericChange = (field: string, text: string) => {
    const numericValue = parseFloat(text) || 0;
    onUpdateNutrition(field, numericValue);
  };

  return (
    <View style={styles.card}>
      <NutritionEditRow
        label="Calories"
        value={log.calories ?? 0}
        unit="kcal"
        semanticColor={colors.semantic.calories}
        onChangeText={(text) => handleNumericChange("calories", text)}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Protein"
        value={log.protein ?? 0}
        unit="g"
        semanticColor={colors.semantic.protein}
        onChangeText={(text) => handleNumericChange("protein", text)}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Carbs"
        value={log.carbs ?? 0}
        unit="g"
        semanticColor={colors.semantic.carbs}
        onChangeText={(text) => handleNumericChange("carbs", text)}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Fat"
        value={log.fat ?? 0}
        unit="g"
        semanticColor={colors.semantic.fat}
        onChangeText={(text) => handleNumericChange("fat", text)}
      />
    </View>
  );
};

const createCardStyles = (colors: any, themeObj: any) =>
  StyleSheet.create({
    card: {
      paddingHorizontal: themeObj.spacing.md,
      borderRadius: themeObj.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    divider: {
      height: 1,
      marginHorizontal: -themeObj.spacing.md,
    },
  });

const createRowStyles = (colors: any, themeObj: any) =>
  StyleSheet.create({
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
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 100,
    },
    nutritionInput: {
      ...themeObj.typography.Body,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: themeObj.spacing.sm,
      paddingVertical: themeObj.spacing.xs,
      minWidth: 60,
      textAlign: "right",
    },
    unitText: {
      ...themeObj.typography.Caption,
      marginLeft: themeObj.spacing.xs,
      minWidth: 30,
    },
    divider: {
      height: 1,
      marginHorizontal: -themeObj.spacing.md,
    },
  });

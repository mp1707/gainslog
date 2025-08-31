import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, useThemedStyles } from "@/theme";
import { FoodLog } from "@/types/models";
import { SkeletonPill } from "../shared";
import { TextInput } from "../shared/TextInput";

interface NutritionEditRowProps {
  label: string;
  value: number;
  unit: string;
  semanticColor: string;
  onChangeText: (text: string) => void;
  isLoading?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

const NutritionEditRow: React.FC<NutritionEditRowProps> = ({
  label,
  value,
  unit,
  semanticColor,
  onChangeText,
  isLoading = false,
  onBlur,
  onFocus,
}) => {
  const { colors, colorScheme, theme } = useTheme();
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
        {isLoading ? (
          <SkeletonPill width={60} height={30} />
        ) : (
          <TextInput
            containerStyle={[styles.nutritionInput]}
            value={String(value || "")}
            onChangeText={onChangeText}
            keyboardType="numeric"
            textAlign="right"
            placeholder="0"
            onBlur={onBlur}
            onFocus={onFocus}
            fontSize="Body"
            style={{
              backgroundColor: colors.primaryBackground,
              borderRadius: theme.components.cards.cornerRadius,
            }}
          />
        )}
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
  isStale?: boolean;
  isLoading?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const NutritionEditCard: React.FC<NutritionEditCardProps> = ({
  log,
  onUpdateNutrition,
  isStale = false,
  isLoading = false,
  onBlur,
  onFocus,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createCardStyles);

  const handleNumericChange = (field: string, text: string) => {
    const numericValue = parseFloat(text) || 0;
    onUpdateNutrition(field, numericValue);
  };

  return (
    <View style={[styles.card, isStale && styles.stale]}>
      <NutritionEditRow
        label="Calories"
        value={log.calories ?? 0}
        unit="kcal"
        semanticColor={colors.semantic.calories}
        onChangeText={(text) => handleNumericChange("calories", text)}
        isLoading={isLoading}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Protein"
        value={log.protein ?? 0}
        unit="g"
        semanticColor={colors.semantic.protein}
        onChangeText={(text) => handleNumericChange("protein", text)}
        isLoading={isLoading}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Carbs"
        value={log.carbs ?? 0}
        unit="g"
        semanticColor={colors.semantic.carbs}
        onChangeText={(text) => handleNumericChange("carbs", text)}
        isLoading={isLoading}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <NutritionEditRow
        label="Fat"
        value={log.fat ?? 0}
        unit="g"
        semanticColor={colors.semantic.fat}
        onChangeText={(text) => handleNumericChange("fat", text)}
        isLoading={isLoading}
        onBlur={onBlur}
        onFocus={onFocus}
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
    stale: {
      opacity: 0.6,
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
      gap: themeObj.spacing.xs,
    },
    nutritionInput: {
      minWidth: 60,
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

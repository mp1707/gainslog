import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./MacroDistributionCard.styles";

interface MacroDistributionCardProps {
  calories: number;
  protein: number;
  fatGrams: number;
  carbsGrams: number;
  fatPercentage: number;
}

export const MacroDistributionCard: React.FC<MacroDistributionCardProps> = ({
  calories,
  protein,
  fatGrams,
  carbsGrams,
  fatPercentage,
}) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  const proteinCalories = protein * 4;
  const remainingCalories = calories - proteinCalories;
  const fatCalories = fatGrams * 9;
  const carbCalories = carbsGrams * 4;

  return (
    <View style={styles.nutritionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.nutritionHeadline}>
            Remaining Calorie Distribution
          </Text>
          <Text style={styles.cardDescription}>
            After protein ({protein}g = {proteinCalories} calories), you have{" "}
            {remainingCalories} calories left to distribute
          </Text>
        </View>
      </View>

      <View style={styles.macroDistributionInfo}>
        <View style={styles.macroBreakdownRow}>
          <View
            style={[
              styles.macroColorIndicator,
              { backgroundColor: colors.semantic.fat },
            ]}
          />
          <Text style={styles.macroDistributionText}>
            Fat: {fatPercentage}% ({fatGrams}g = {fatCalories} cal)
          </Text>
        </View>
        <View style={styles.macroBreakdownRow}>
          <View
            style={[
              styles.macroColorIndicator,
              { backgroundColor: colors.semantic.carbs },
            ]}
          />
          <Text style={styles.macroDistributionText}>
            Carbs: {Math.round((carbCalories / calories) * 100)}% ({carbsGrams}g ={" "}
            {carbCalories} cal)
          </Text>
        </View>
      </View>
    </View>
  );
};
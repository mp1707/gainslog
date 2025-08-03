import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { NutritionSlider } from "@/shared/ui/atoms/NutritionSlider/NutritionSlider";
import { createStyles } from "./MacroSplitCard.styles";

interface MacroSplitCardProps {
  calories: number;
  protein: number;
  fatGrams: number;
  carbsGrams: number;
  fatPercentage: number;
  maxFatPercentage: number;
  onFatPercentageChange: (percentage: number) => void;
}

export const MacroSplitCard: React.FC<MacroSplitCardProps> = ({
  calories,
  protein,
  fatGrams,
  carbsGrams,
  fatPercentage,
  maxFatPercentage,
  onFatPercentageChange,
}) => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj, colorScheme);

  const proteinCalories = protein * 4;
  const remainingCalories = calories - proteinCalories;
  const fatCalories = fatGrams * 9;
  const carbCalories = carbsGrams * 4;
  const carbsPercentage = Math.round((carbCalories / calories) * 100);
  const isInRecommendedRange = fatPercentage >= 25 && fatPercentage <= 35;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Fine-Tune Macro Split</Text>
        <Text style={styles.description}>
          After protein ({protein}g = {proteinCalories.toFixed(0)} kcal), you
          have {remainingCalories.toFixed(0)} calories left. Adjust the slider
          to set your desired fat intake, and the rest will be carbs.
        </Text>
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
            Fat: {fatPercentage}% ({fatGrams.toFixed(0)}g ={" "}
            {fatCalories.toFixed(0)} kcal)
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
            Carbs: {carbsPercentage}% ({carbsGrams.toFixed(0)}g ={" "}
            {carbCalories.toFixed(0)} kcal)
          </Text>
        </View>
      </View>

      <NutritionSlider
        label="Fat Percentage"
        unit="%"
        value={fatPercentage}
        minimumValue={10}
        maximumValue={maxFatPercentage}
        step={1}
        onValueChange={onFatPercentageChange}
      />

      <View
        style={[
          styles.fatCalculatedInfo,
          isInRecommendedRange && {
            backgroundColor: colors.successBackground,
          },
        ]}
      >
        <Text
          style={[
            styles.fatCalculatedText,
            isInRecommendedRange && { color: colors.success },
          ]}
        >
          {fatPercentage}% of {calories} calories = {fatGrams.toFixed(0)}g fat
          {"\n"}
          {isInRecommendedRange
            ? "Within recommended range"
            : "Outside recommended range"}
        </Text>
      </View>

      <View style={styles.educationalCallout}>
        <Text style={styles.educationalTitle}>💡 Nutrition Tip</Text>
        <Text style={styles.educationalText}>
          A common guideline is 25-35% of calories from fat. For muscle gain,
          aim for 25-30%. For fat loss, 30-35% can help with satiety.
        </Text>
      </View>
    </View>
  );
};

import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { NutritionSlider } from "@/shared/ui/atoms/NutritionSlider/NutritionSlider";
import { createStyles } from "./MacroDistributionSection.styles";

type MacroDistributionVariant = "card" | "flat";

interface MacroDistributionSectionProps {
  calories: number;
  protein: number;
  fatGrams: number;
  carbsGrams: number;
  fatPercentage: number;
  maxFatPercentage: number;
  onFatPercentageChange: (percentage: number) => void;
  variant?: MacroDistributionVariant;
}

export const MacroDistributionSection: React.FC<
  MacroDistributionSectionProps
> = ({
  calories,
  protein,
  fatGrams,
  carbsGrams,
  fatPercentage,
  maxFatPercentage,
  onFatPercentageChange,
  variant = "flat",
}) => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj, colorScheme);

  const proteinCalories = protein * 4;
  const fatCalories = fatGrams * 9;
  const carbCalories = carbsGrams * 4;
  const carbsPercentage = Math.round(
    (carbCalories / Math.max(calories, 1)) * 100
  );

  return (
    <View
      style={[styles.container, variant === "flat" && styles.containerFlat]}
    >
      <View style={styles.row}>
        <View style={styles.pill}>
          <View
            style={[styles.dot, { backgroundColor: colors.semantic.fat }]}
          />
          <Text style={styles.pillText}>
            Fat • {fatPercentage}% ({fatGrams.toFixed(0)}g,{" "}
            {fatCalories.toFixed(0)} kcal)
          </Text>
        </View>
        <View style={[styles.pill, styles.pillRight]}>
          <View
            style={[styles.dot, { backgroundColor: colors.semantic.carbs }]}
          />
          <Text style={styles.pillText}>
            Carbs • {carbsPercentage}% ({carbsGrams.toFixed(0)}g,{" "}
            {carbCalories.toFixed(0)} kcal)
          </Text>
        </View>
      </View>

      <View style={styles.sliderBlock}>
        <NutritionSlider
          label="Fat Percentage"
          unit="%"
          value={fatPercentage}
          minimumValue={10}
          maximumValue={maxFatPercentage}
          step={1}
          onValueChange={onFatPercentageChange}
        />
        <Text style={styles.helperText}>
          Remaining calories go to carbohydrates.
        </Text>
      </View>
    </View>
  );
};

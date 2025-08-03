import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { NutritionSlider } from "@/shared/ui/atoms/NutritionSlider/NutritionSlider";
import { createStyles } from "./FatPercentageCard.styles";

interface FatPercentageCardProps {
  calories: number;
  fatPercentage: number;
  fatGrams: number;
  maxFatPercentage: number;
  onFatPercentageChange: (percentage: number) => void;
}

export const FatPercentageCard: React.FC<FatPercentageCardProps> = ({
  calories,
  fatPercentage,
  fatGrams,
  maxFatPercentage,
  onFatPercentageChange,
}) => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj, colorScheme);

  const isInRecommendedRange = fatPercentage >= 25 && fatPercentage <= 35;

  return (
    <View style={styles.nutritionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.nutritionHeadline}>Fine-Tune Fat Percentage</Text>
          <Text style={styles.cardDescription}>
            Adjust what percentage of your calories come from fat
          </Text>
        </View>
      </View>

      {/* Educational content */}
      <View style={styles.educationalCallout}>
        <Text style={styles.educationalTitle}>💡 Nutrition Tip</Text>
        <Text style={styles.educationalText}>
          For advanced strength athletes, a fat intake of 25-35% of total daily
          calories is recommended for optimal hormone production and nutrient
          absorption.
        </Text>
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
          isInRecommendedRange && styles.fatCalculatedInfoRecommended,
        ]}
      >
        <Text
          style={[
            styles.fatCalculatedText,
            isInRecommendedRange && { color: colors.semantic.calories },
          ]}
        >
          {fatPercentage}% of {calories} calories = {fatGrams}g fat
          {isInRecommendedRange && " ✓ Within recommended range"}
        </Text>
      </View>
    </View>
  );
};

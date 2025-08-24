import React from "react";
import { View } from "react-native";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./NutritionList.styles";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionListProps {
  nutrition: NutritionData;
}

export const NutritionList: React.FC<NutritionListProps> = ({ nutrition }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const nutritionItems = [
    {
      key: "calories",
      value: Math.round(nutrition.calories),
      label: "kcal",
      color: colors.semantic.calories,
    },
    {
      key: "protein",
      value: Math.round(nutrition.protein),
      label: "g Protein",
      color: colors.semantic.protein,
    },
    {
      key: "carbs",
      value: Math.round(nutrition.carbs),
      label: "g Carbs",
      color: colors.semantic.carbs,
    },
    {
      key: "fat",
      value: Math.round(nutrition.fat),
      label: "g Fat",
      color: colors.semantic.fat,
    },
  ];

  return (
    <View style={styles.nutritionList}>
      {nutritionItems.map((item) => (
        <View key={item.key} style={styles.nutritionRow}>
          <View style={[styles.nutritionDot, { backgroundColor: item.color }]} />
          <View style={styles.nutritionValueContainer}>
            <AppText style={styles.nutritionText}>{item.value}</AppText>
          </View>
          <AppText style={styles.nutritionText}>{item.label}</AppText>
        </View>
      ))}
    </View>
  );
};
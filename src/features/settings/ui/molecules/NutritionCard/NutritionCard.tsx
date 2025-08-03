import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { AnimatedCalculatorButton } from "@/shared/ui/atoms/AnimatedCalculatorButton";
import { ProteinCalculationMethod } from "@/shared/ui/atoms/ProteinCalculationCard";
import { CALCULATION_METHODS } from "@/shared/ui/atoms/CalorieCalculationCard";
import { GoalType } from "@/shared/ui/atoms/GoalSelectionCard";
import { createStyles } from "./NutritionCard.styles";

interface NutritionConfig {
  key: "calories" | "protein";
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

interface CalorieCalculation {
  method: (typeof CALCULATION_METHODS)[keyof typeof CALCULATION_METHODS];
  params: {
    sex: "male" | "female";
    age: number;
    weight: number;
    height: number;
  };
  goalType: GoalType;
}

interface ProteinCalculation {
  method: ProteinCalculationMethod;
  bodyWeight: number;
  calculatedProtein: number;
}

interface NutritionCardProps {
  config: NutritionConfig;
  value: number;
  isFieldDisabled: boolean;
  onValueChange: (key: "calories" | "protein", value: number) => void;
  onCalculatorPress: () => void;
  calorieCalculation?: CalorieCalculation | null;
  proteinCalculation?: ProteinCalculation | null;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  config,
  value,
  isFieldDisabled,
  onValueChange,
  onCalculatorPress,
  calorieCalculation,
  proteinCalculation,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  // Pass the current color scheme to ensure scheme-aware component styles
  const styles = createStyles(colors, theme, colorScheme);

  const isProteinCard = config.key === "protein";
  const isCalorieCard = config.key === "calories";

  const getCardDescription = (key: "calories" | "protein"): string => {
    switch (key) {
      case "calories":
        return "Your total energy intake target for the day.";
      case "protein":
        return "Essential for muscle growth and recovery.";
      default:
        return "";
    }
  };

  const getGoalTitle = (goalType: GoalType): string => {
    switch (goalType) {
      case "lose":
        return "Lose Weight";
      case "maintain":
        return "Maintain Weight";
      case "gain":
        return "Gain Weight";
      default:
        return "";
    }
  };

  return (
    <View style={styles.nutritionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.nutritionHeadline}>{config.label}</Text>
          <Text style={styles.cardDescription}>
            {getCardDescription(config.key)}
          </Text>
        </View>
        {(isCalorieCard || isProteinCard) && !isFieldDisabled && (
          <AnimatedCalculatorButton
            isCalorieCard={isCalorieCard}
            onPress={onCalculatorPress}
          />
        )}
      </View>

      {/* Show selected calculation method for calories */}
      {isCalorieCard && calorieCalculation && (
        <View style={styles.calculationInfo}>
          <View style={styles.calculationHeader}>
            <Text style={styles.calculationMethodTitle}>
              {getGoalTitle(calorieCalculation.goalType)}
            </Text>
            <Text style={styles.bodyWeightText}>
              {calorieCalculation.params.sex === "male" ? "Male" : "Female"},{" "}
              {calorieCalculation.params.age} years,{" "}
              {calorieCalculation.params.weight}kg,{" "}
              {calorieCalculation.params.height}cm
            </Text>
          </View>
          <Text style={styles.calculatedValue}>
            Activity Level: {calorieCalculation.method.label}
          </Text>
          <Text style={styles.calculationSubtext}>
            {calorieCalculation.method.description}
          </Text>
        </View>
      )}

      {/* Show selected calculation method for protein */}
      {isProteinCard && proteinCalculation && (
        <View style={styles.calculationInfoProtein}>
          <View style={styles.calculationHeader}>
            <Text style={styles.calculationMethodTitle}>
              {proteinCalculation.method.title}
            </Text>
            <Text style={styles.bodyWeightText}>
              {proteinCalculation.bodyWeight}kg body weight
            </Text>
          </View>
          <Text style={styles.calculatedValueProtein}>
            Recommended: {proteinCalculation.calculatedProtein}g daily
          </Text>
          <Text style={styles.calculationSubtext}>
            {proteinCalculation.method.description}
          </Text>
        </View>
      )}

      <View style={styles.settingsGroup}>
        <View style={styles.nutritionSettingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Target</Text>
            <Text style={styles.settingSubtext}>
              Set your daily {config.label.toLowerCase()} goal
            </Text>
          </View>
          <Stepper
            value={value}
            min={config.min}
            max={config.max}
            step={config.step}
            onChange={(newValue) => onValueChange(config.key, newValue)}
            type={config.key}
            disabled={isFieldDisabled}
          />
        </View>
      </View>
    </View>
  );
};

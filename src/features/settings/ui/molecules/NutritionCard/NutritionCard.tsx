import React from "react";
import { View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { AnimatedCalculatorButton } from "@/shared/ui/atoms/AnimatedCalculatorButton";
import { ProteinCalculationMethod } from "@/shared/ui/atoms/ProteinCalculationCard";
import { CALCULATION_METHODS } from "@/shared/ui/atoms/CalorieCalculationCard";
import { GoalType } from "@/shared/ui/atoms/GoalSelectionCard";
import { createStyles } from "./NutritionCard.styles";
import { AppText } from "src/components";

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

type NutritionCardVariant = "card" | "flat";

interface NutritionCardProps {
  config: NutritionConfig;
  value: number;
  isFieldDisabled: boolean;
  onValueChange: (key: "calories" | "protein", value: number) => void;
  onCalculatorPress: () => void;
  calorieCalculation?: CalorieCalculation | null;
  proteinCalculation?: ProteinCalculation | null;
  variant?: NutritionCardVariant;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  config,
  value,
  isFieldDisabled,
  onValueChange,
  onCalculatorPress,
  calorieCalculation,
  proteinCalculation,
  variant = "card",
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
    <View
      style={[
        styles.nutritionCard,
        variant === "flat" && styles.nutritionCardFlat,
      ]}
    >
      {variant !== "flat" && (
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <AppText role="Headline">{config.label}</AppText>
            <AppText role="Body" color="secondary" style={{ marginTop: 4 }}>
              {getCardDescription(config.key)}
            </AppText>
          </View>
        </View>
      )}

      {/* Recommended section with primary calculator CTA */}
      {(isCalorieCard || isProteinCard) && !isFieldDisabled && (
        <View style={styles.recommendedSection}>
          <AppText role="Caption" style={{ marginBottom: 4 }}>
            Recommended
          </AppText>
          <AppText role="Body" color="secondary" style={{ marginBottom: 16 }}>
            Get a personalized {config.label.toLowerCase()} target based on your
            body and goals.
          </AppText>
          <AnimatedCalculatorButton
            isCalorieCard={isCalorieCard}
            onPress={onCalculatorPress}
            variant="primary"
            hasCalculation={
              !!(isCalorieCard ? calorieCalculation : proteinCalculation)
            }
          />
        </View>
      )}

      {/* Show selected calculation method for calories */}
      {isCalorieCard && calorieCalculation && (
        <View style={styles.calculationInfo}>
          <View style={styles.calculationHeader}>
            <AppText role="Headline" style={{ marginBottom: 2 }}>
              {getGoalTitle(calorieCalculation.goalType)}
            </AppText>
            <AppText role="Body" color="secondary">
              {calorieCalculation.params.sex === "male" ? "Male" : "Female"},{" "}
              {calorieCalculation.params.age} years,{" "}
              {calorieCalculation.params.weight}kg,{" "}
              {calorieCalculation.params.height}cm
            </AppText>
          </View>
          <AppText
            role="Headline"
            style={{ color: colors.semantic.calories, marginBottom: 8 }}
          >
            Activity Level: {calorieCalculation.method.label}
          </AppText>
          <AppText role="Body" color="secondary">
            {calorieCalculation.method.description}
          </AppText>
        </View>
      )}

      {/* Show selected calculation method for protein */}
      {isProteinCard && proteinCalculation && (
        <View style={styles.calculationInfoProtein}>
          <View style={styles.calculationHeader}>
            <AppText role="Headline" style={{ marginBottom: 2 }}>
              {proteinCalculation.method.title}
            </AppText>
            <AppText role="Body" color="secondary">
              {proteinCalculation.bodyWeight}kg body weight
            </AppText>
          </View>
          <AppText
            role="Headline"
            style={{ color: colors.semantic.protein, marginBottom: 8 }}
          >
            Recommended: {proteinCalculation.calculatedProtein}g daily
          </AppText>
          <AppText role="Body" color="secondary">
            {proteinCalculation.method.description}
          </AppText>
        </View>
      )}

      {/* Manual override section */}
      <View style={styles.manualOverrideSection}>
        <View style={styles.manualOverrideSectionHeader}>
          <AppText role="Caption" style={{ marginBottom: 8 }}>
            Manual
          </AppText>
          <AppText role="Body" color="secondary">
            Set your own target below.
          </AppText>
        </View>
        <View style={styles.nutritionSettingRow}>
          <View style={styles.settingInfo}>
            <AppText role="Headline" style={{ marginBottom: 4 }}>
              Daily target
            </AppText>
            <AppText role="Body" color="secondary">
              Adjust your daily {config.label.toLowerCase()} goal
            </AppText>
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

import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { AppText } from "src/components";
import { AnimatedCalculatorButton } from "@/shared/ui/atoms/AnimatedCalculatorButton";
import { CalculationInfoCard } from "@/shared/ui/molecules/CalculationInfoCard";
import { Stepper } from "@/shared/ui/atoms/Stepper";

interface NutritionAccordionContentProps {
  // Calculator section (optional for types like fat)
  calculatorType?: "calories" | "protein" | "fat";
  calculatorDescription?: string;
  onCalculatorPress?: () => void;
  calculationInfo?: {
    type: "calories" | "protein" | "fat";
    headerTitle?: string;
    headerSubtitle?: string;
    highlightText: string;
    description?: string;
  } | null;
  
  // Manual stepper section
  stepperLabel?: string;
  stepperValue: number;
  stepperMin: number;
  stepperMax: number;
  stepperStep: number;
  onStepperChange: (value: number) => void;
  stepperType: "calories" | "protein" | "fat";
  stepperDisabled?: boolean;
}

export const NutritionAccordionContent: React.FC<NutritionAccordionContentProps> = ({
  calculatorType,
  calculatorDescription,
  onCalculatorPress,
  calculationInfo,
  stepperLabel = "Set your own target below.",
  stepperValue,
  stepperMin,
  stepperMax,
  stepperStep,
  onStepperChange,
  stepperType,
  stepperDisabled = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    content: {
      gap: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.content}>
      {/* Recommended Calculator Section (only for calories/protein) */}
      {calculatorType && calculatorDescription && onCalculatorPress && (
        <>
          <View>
            <AppText role="Body" color="secondary">
              {calculatorDescription}
            </AppText>
          </View>
          
          <AnimatedCalculatorButton
            isCalorieCard={calculatorType === "calories"}
            onPress={onCalculatorPress}
          />
        </>
      )}

      {/* Selected Calculation Details */}
      {calculationInfo && (
        <CalculationInfoCard
          type={calculationInfo.type}
          headerTitle={calculationInfo.headerTitle}
          headerSubtitle={calculationInfo.headerSubtitle}
          highlightText={calculationInfo.highlightText}
          description={calculationInfo.description}
        />
      )}

      {/* Manual Override Section */}
      {stepperLabel && (
        <AppText role="Body" color="secondary">
          {stepperLabel}
        </AppText>
      )}

      <Stepper
        value={stepperValue}
        min={stepperMin}
        max={stepperMax}
        step={stepperStep}
        onChange={onStepperChange}
        type={stepperType}
        disabled={stepperDisabled}
      />
    </View>
  );
};